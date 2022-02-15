import {
  CommitSubjectParser,
  commitSubjectBelongsToAQueue
} from './commit-subject-parser'
import {
  CommittedMessage,
  NewJobCommittedMessage,
  nullMessage
} from './committed-message'
import {DefaultLogFields, ListLogLine, LogResult} from 'simple-git'
import {
  GitDirNotInitializedError,
  NoPendingJobsFoundError,
  PendingJobsLimitReachedError
} from './errors'
import {JobFinishedMessage, Message, NewJobMessage} from './message'

import {CommitBody} from './commit-body'
import {CommitHash} from './commit-hash'
import {CommitInfo} from './commit-info'
import {CommitMessage} from './commit-message'
import {CommitOptions} from './commit-options'
import {CommitSubject} from './commit-subject'
import {CommittedMessageLog} from './committed-message-log'
import {GitRepo} from './git-repo'
import {GitRepoDir} from './git-repo-dir'
import {QueueName} from './queue-name'

export class Queue {
  private readonly name: QueueName
  private readonly gitRepo: GitRepo
  private readonly commitOptions: CommitOptions
  private committedMessages: CommittedMessageLog

  private constructor(
    name: QueueName,
    gitRepo: GitRepo,
    commitOptions: CommitOptions
  ) {
    this.name = name
    this.gitRepo = gitRepo
    this.commitOptions = commitOptions
    this.committedMessages = CommittedMessageLog.fromGitLogCommits([])
  }

  static async create(
    name: QueueName,
    gitRepo: GitRepo,
    commitOptions: CommitOptions
  ): Promise<Queue> {
    const queue = new Queue(name, gitRepo, commitOptions)
    await queue.loadMessagesFromGit()
    return queue
  }

  guardThatGitRepoHasBeenInitialized(): void {
    const isInitialized = this.gitRepo.isInitialized()
    if (!isInitialized) {
      throw new GitDirNotInitializedError(this.gitRepo.getDirPath())
    }
  }

  private filterQueueCommits(
    gitLog: LogResult<DefaultLogFields>
  ): (DefaultLogFields & ListLogLine)[] {
    return gitLog.all.filter(commit =>
      this.commitBelongsToQueue(commit.message)
    )
  }

  async loadMessagesFromGit(): Promise<void> {
    this.guardThatGitRepoHasBeenInitialized()

    const noCommits = !(await this.gitRepo.hasCommits()) ? true : false

    if (noCommits) {
      return
    }

    const allCommits = await this.gitRepo.log()

    const thisQueueCommits = this.filterQueueCommits(allCommits)

    this.committedMessages =
      CommittedMessageLog.fromGitLogCommits(thisQueueCommits)
  }

  getGitRepoDir(): GitRepoDir {
    return this.gitRepo.getDir()
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

    const commitResult = await this.gitRepo.commit(
      commitMessage,
      this.commitOptions
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
    return new CommitMessage(
      CommitSubject.fromMessageAndQueueName(message, this.name),
      CommitBody.fromMessage(message)
    )
  }
}
