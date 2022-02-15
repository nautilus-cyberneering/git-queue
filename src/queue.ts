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
import {QueueName} from './queue-name'

export class Queue {
  private readonly name: QueueName
  private readonly gitRepoDir: string
  private readonly git: SimpleGit
  private readonly commitOptions: CommitOptions
  private committedMessages: readonly CommittedMessage[]

  private constructor(
    name: QueueName,
    gitRepoDir: string,
    git: SimpleGit,
    commitOptions: CommitOptions
  ) {
    this.name = name
    this.gitRepoDir = gitRepoDir
    this.git = git
    this.commitOptions = commitOptions
    this.committedMessages = []
  }

  static async create(
    name: QueueName,
    gitRepoDir: string,
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
      this.committedMessages = commits.map(commit =>
        CommittedMessage.fromCommitInfo(CommitInfo.fromDefaultLogFields(commit))
      )
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

  getGitRepoDir(): string {
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
    return this.committedMessages
  }

  getLatestMessage(): CommittedMessage {
    return this.isEmpty() ? nullMessage() : this.committedMessages[0]
  }

  isEmpty(): boolean {
    return this.committedMessages.length === 0
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
    return committedMessage.commit
  }

  findCommittedMessageByCommit(commitHash: CommitHash): CommittedMessage {
    const commits = this.committedMessages.filter(message =>
      message.commitHash().equalsTo(commitHash)
    )

    if (commits.length === 0) {
      return nullMessage()
    }

    return commits[0]
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
