import {
  CommittedMessage,
  JobFinishedCommittedMessage,
  JobStartedCommittedMessage,
  NewJobCommittedMessage
} from './committed-message'
import {
  GitDirNotInitializedError,
  MissingJobStartedMessageError,
  MissingNewJobMessageError,
  PendingJobsLimitReachedError
} from './errors'
import {Job, nullJob} from './job'
import {
  JobFinishedMessage,
  JobStartedMessage,
  Message,
  NewJobMessage
} from './message'

import {CommitBody} from './commit-body'
import {CommitInfo} from './commit-info'
import {CommitMessage} from './commit-message'
import {CommitOptions} from './commit-options'
import {CommitSubject} from './commit-subject'
import {CommittedMessageLog} from './committed-message-log'
import {GitRepo} from './git-repo'
import {GitRepoDir} from './git-repo-dir'
import {QueueName} from './queue-name'
import {CommitHash} from './commit-hash'

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
    const isInitialized = this.gitRepo.isInitialized()
    if (!isInitialized) {
      throw new GitDirNotInitializedError(this.gitRepo.getDirPath())
    }
  }

  // Job states: new -> started -> finished

  private guardThatLastMessageWasNewJob(latestMessage: CommittedMessage): void {
    if (!(latestMessage instanceof NewJobCommittedMessage)) {
      throw new MissingNewJobMessageError(latestMessage)
    }
  }

  private guardThatLastMessageWasJobStarted(
    latestMessage: CommittedMessage
  ): void {
    if (!(latestMessage instanceof JobStartedCommittedMessage)) {
      throw new MissingJobStartedMessageError(latestMessage)
    }
  }

  private guardThatLastMessageWasJobFinishedOrNull(
    latestMessage: CommittedMessage
  ): void {
    if (latestMessage.isNull()) return

    if (!(latestMessage instanceof JobFinishedCommittedMessage)) {
      throw new PendingJobsLimitReachedError(latestMessage)
    }
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

    const committedMessage = this.committedMessages.findByCommitHash(
      new CommitHash(commitResult.commit)
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

  getGitRepo(): GitRepo {
    return this.gitRepo
  }

  getGitRepoDir(): GitRepoDir {
    return this.gitRepo.getDir()
  }

  getGitRepoDirPath(): string {
    return this.gitRepo.getDirPath()
  }

  getMessages(): readonly CommittedMessage[] {
    return this.committedMessages.getMessages()
  }

  getLatestMessage(): CommittedMessage {
    return this.committedMessages.getLatestMessage()
  }

  isEmpty(): boolean {
    const nextJob = this.getNextJob()
    return nextJob.isNull()
  }

  getNextJob(): Job {
    // Job states: new -> started -> finished

    const latestMessage = this.getLatestMessage()

    if (latestMessage instanceof NewJobCommittedMessage) {
      return Job.fromCommittedMessage(latestMessage)
    }

    if (latestMessage instanceof JobStartedCommittedMessage) {
      return Job.fromCommittedMessage(
        this.committedMessages.getNextToLatestMessage()
      )
    }

    if (latestMessage instanceof JobFinishedCommittedMessage) {
      return nullJob()
    }

    return nullJob()
  }

  // Job states: new -> started -> finished

  async createJob(payload: string): Promise<Job> {
    const latestMessage = this.getLatestMessage()

    this.guardThatLastMessageWasJobFinishedOrNull(latestMessage)

    const message = new NewJobMessage(payload)

    const commit = await this.commitMessage(message)

    const newJobId = 0 //latestMessage.isNull() ? 0 : latestMessage.getIdFromMessage() + 1

    return new Job(payload, commit.hash, newJobId)
  }

  async markJobAsStarted(payload: string): Promise<CommitInfo> {
    this.guardThatLastMessageWasNewJob(this.getLatestMessage())

    const pendingJob = this.getNextJob()

    const message = new JobStartedMessage(payload, pendingJob.getCommitHash())

    const commit = await this.commitMessage(message)

    return commit
  }

  async markJobAsFinished(payload: string): Promise<CommitInfo> {
    this.guardThatLastMessageWasJobStarted(this.getLatestMessage())

    const pendingJob = this.getNextJob()

    const message = new JobFinishedMessage(payload, pendingJob.getCommitHash())

    const commit = await this.commitMessage(message)

    return commit
  }
}
