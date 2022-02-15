import {
  CommitSubjectParser,
  commitSubjectBelongsToAQueue
} from './commit-subject-parser'
import {
  CommittedMessage,
  NewJobCommittedMessage,
  nullMessage
} from './committed-message'
import {GitResponseError, SimpleGit} from 'simple-git'
import {JobFinishedMessage, Message, NewJobMessage} from './message'
import {NoPendingJobsFoundError, PendingJobsLimitReachedError} from './errors'

import {CommitBody} from './commit-body'
import {CommitHash} from './commit-hash'
import {CommitInfo} from './commit-info'
import {CommitMessage} from './commit-message'
import {CommitOptions} from './commit-options'
import {CommitSubject} from './commit-subject'
import {CommittedMessageLog} from './committed-message-log'
import {GitRepoDir} from './git-repo-dir'
import {QueueName} from './queue-name'

export class Queue {
  private readonly name: QueueName
  private readonly gitRepoDir: GitRepoDir
  private readonly git: SimpleGit
  private readonly commitOptions: CommitOptions
  private committedMessages: CommittedMessageLog

  private constructor(
    name: QueueName,
    gitRepoDir: GitRepoDir,
    git: SimpleGit,
    commitOptions: CommitOptions
  ) {
    this.name = name
    this.gitRepoDir = gitRepoDir
    this.git = git
    this.commitOptions = commitOptions
    this.committedMessages = CommittedMessageLog.fromGitLogCommits([])
  }

  static async create(
    name: QueueName,
    gitRepoDir: GitRepoDir,
    git: SimpleGit,
    commitOptions: CommitOptions
  ): Promise<Queue> {
    const queue = new Queue(name, gitRepoDir, git, commitOptions)
    await queue.loadMessagesFromGit()
    return queue
  }

  async loadMessagesFromGit(): Promise<void> {
    const isRepo = await this.git.checkIsRepo()
    if (!isRepo) {
      throw Error(`Invalid git dir: ${this.gitRepoDir}`)
    }

    const status = await this.git.status()
    const currentBranch = status.current

    try {
      const gitLog = await this.git.log()
      const commits = gitLog.all.filter(commit =>
        this.commitBelongsToQueue(commit.message)
      )
      this.committedMessages = CommittedMessageLog.fromGitLogCommits(commits)
    } catch (err) {
      if (
        (err as GitResponseError).message.includes(
          `fatal: your current branch '${currentBranch}' does not have any commits yet`
        )
      ) {
        // no commits yet
      } else {
        throw err
      }
    }
  }

  getGitRepoDir(): GitRepoDir {
    return this.gitRepoDir
  }

  commitBelongsToQueue(commitSubject: string): boolean {
    if (!commitSubjectBelongsToAQueue(commitSubject)) {
      return false
    }
    return CommitSubjectParser.parseText(commitSubject).belongsToQueue(
      this.name
    )
  }

  getMessages(): readonly CommittedMessage[] {
    return this.committedMessages.getMessages()
  }

  getLatestMessage(): CommittedMessage {
    return this.committedMessages.getLatestMessage()
  }

  isEmpty(): boolean {
    return this.committedMessages.isEmpty()
  }

  getNextJob(): CommittedMessage {
    const latestMessage = this.getLatestMessage()
    return latestMessage instanceof NewJobCommittedMessage
      ? latestMessage
      : nullMessage()
  }

  guardThatThereIsNoPendingJobs(): void {
    if (!this.getNextJob().isNull()) {
      throw new PendingJobsLimitReachedError(
        this.getNextJob().commitHash().toString()
      )
    }
  }

  guardThatThereIsAPendingJob(): CommittedMessage {
    const pendingJob = this.getNextJob()
    if (pendingJob.isNull()) {
      throw new NoPendingJobsFoundError(this.name.toString())
    }
    return pendingJob
  }

  async createJob(payload: string): Promise<CommitInfo> {
    this.guardThatThereIsNoPendingJobs()

    const message = new NewJobMessage(payload)

    return this.commitMessage(message)
  }

  async markJobAsFinished(payload: string): Promise<CommitInfo> {
    const pendingJob = this.guardThatThereIsAPendingJob()

    const message = new JobFinishedMessage(payload, pendingJob.commitHash())

    return this.commitMessage(message)
  }

  async commitMessage(message: Message): Promise<CommitInfo> {
    const commitMessage = this.buildCommitMessage(message)
    const commitResult = await this.git.commit(
      commitMessage.forSimpleGit(),
      this.commitOptions.forSimpleGit()
    )
    await this.loadMessagesFromGit()
    const committedMessage = this.findCommittedMessageByCommit(
      new CommitHash(commitResult.commit)
    )
    return committedMessage.commitInfo()
  }

  findCommittedMessageByCommit(commitHash: CommitHash): CommittedMessage {
    return this.committedMessages.findByCommit(commitHash)
  }

  buildCommitMessage(message: Message): CommitMessage {
    const commitSubject = this.buildCommitSubject(message)
    const commitBody = this.buildCommitBody(message)
    return new CommitMessage(commitSubject, commitBody)
  }

  buildCommitSubject(message: Message): CommitSubject {
    return CommitSubject.fromMessageAndQueueName(message, this.name)
  }

  buildCommitBody(message: Message): CommitBody {
    return new CommitBody(message.getPayload())
  }
}
