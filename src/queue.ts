import {
  CommittedMessage,
  NewJobCommittedMessage,
  nullMessage
} from './committed-message'
import {
  GitDirNotInitializedError,
  NoPendingJobsFoundError,
  PendingJobsLimitReachedError
} from './errors'
import {
  JobFinishedMessage,
  JobStartedMessage,
  Message,
  NewJobMessage
} from './message'

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
import {ShortCommitHash} from './short-commit-hash'

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

  private async guardThatGitRepoHasBeenInitialized(): Promise<void> {
    const isInitialized = await this.gitRepo.isInitialized()
    if (!isInitialized) {
      throw new GitDirNotInitializedError(this.gitRepo.getDirPath())
    }
  }

  private guardThatThereAreNoPendingJobs(): void {
    if (!this.getNextJob().isNull()) {
      throw new PendingJobsLimitReachedError(
        this.getNextJob().commitHash().toString()
      )
    }
  }

  private guardThatThereIsAPendingJob(): CommittedMessage {
    const pendingJob = this.getNextJob()
    if (pendingJob.isNull()) {
      throw new NoPendingJobsFoundError(this.name.toString())
    }
    return pendingJob
  }

  private async loadMessagesFromGit(): Promise<void> {
    await this.guardThatGitRepoHasBeenInitialized()

    const noCommits = !(await this.gitRepo.hasCommits()) ? true : false

    if (noCommits) {
      return
    }

    const logCommits = await this.gitRepo.log()

    const allMessages = CommittedMessageLog.fromGitLogCommits(logCommits.all)

    this.committedMessages = allMessages.filterCommitsByQueue(this.name)
  }

  private async commitMessage(message: Message): Promise<CommitInfo> {
    const commitMessage = this.buildCommitMessage(message)

    const commitResult = await this.gitRepo.commit(
      commitMessage,
      this.commitOptions
    )

    await this.loadMessagesFromGit()

    const committedMessage = this.committedMessages.findByShortCommitHash(
      new ShortCommitHash(commitResult.commit)
    )

    return committedMessage.commitInfo()
  }

  private buildCommitMessage(message: Message): CommitMessage {
    return new CommitMessage(
      CommitSubject.fromMessageAndQueueName(message, this.name),
      CommitBody.fromMessage(message)
    )
  }

  getName(): QueueName {
    return this.name
  }

  getGitRepoDir(): GitRepoDir {
    return this.gitRepo.getDir()
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

  async createJob(payload: string): Promise<CommitInfo> {
    this.guardThatThereAreNoPendingJobs()

    const message = new NewJobMessage(payload)

    const commit = await this.commitMessage(message)

    return commit
  }

  async markJobAsStarted(payload: string): Promise<CommitInfo> {
    const pendingJob = this.guardThatThereIsAPendingJob()

    const message = new JobStartedMessage(payload, pendingJob.commitHash())

    const commit = await this.commitMessage(message)

    return commit
  }

  async markJobAsFinished(payload: string): Promise<CommitInfo> {
    const pendingJob = this.guardThatThereIsAPendingJob()

    const message = new JobFinishedMessage(payload, pendingJob.commitHash())

    const commit = await this.commitMessage(message)

    return commit
  }
}
