import {GitResponseError, SimpleGit} from 'simple-git'
import {JobFinishedMessage, Message, NewJobMessage} from './message'
import {NewJobStoredMessage, StoredMessage, nullMessage} from './stored-message'

import {CommitBody} from './commit-body'
import {CommitHash} from './commit-hash'
import {CommitInfo} from './commit-info'
import {CommitMessage} from './commit-message'
import {CommitOptions} from './commit-options'
import {CommitSubject} from './commit-subject'

export class Queue {
  name: string
  gitRepoDir: string
  git: SimpleGit
  storedMessages: readonly StoredMessage[]

  private constructor(name: string, gitRepoDir: string, git: SimpleGit) {
    this.name = name
    this.gitRepoDir = gitRepoDir
    this.git = git
    this.storedMessages = []
  }

  static async create(
    name: string,
    gitRepoDir: string,
    git: SimpleGit
  ): Promise<Queue> {
    const queue = new Queue(name, gitRepoDir, git)
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
      this.storedMessages = commits.map(commit =>
        StoredMessage.fromCommitInfo(CommitInfo.fromDefaultLogFields(commit))
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

  commitBelongsToQueue(commitSubject: string): boolean {
    if (!CommitSubject.belongsToAnyQueue(commitSubject)) {
      return false
    }
    return new CommitSubject(commitSubject).belongsToQueue(this.name)
  }

  getMessages(): readonly StoredMessage[] {
    return this.storedMessages
  }

  getLatestMessage(): StoredMessage {
    return this.isEmpty() ? nullMessage() : this.storedMessages[0]
  }

  isEmpty(): boolean {
    return this.storedMessages.length === 0
  }

  getNextJob(): StoredMessage {
    const latestMessage = this.getLatestMessage()
    return latestMessage instanceof NewJobStoredMessage
      ? latestMessage
      : nullMessage()
  }

  guardThatThereIsNoPendingJobs(): void {
    if (!this.getNextJob().isEmpty()) {
      throw new Error(
        `Can't create a new job. There is already a pending job in commit: ${this.getNextJob().commitHash()}`
      )
    }
  }

  guardThatThereIsAPendingJob(): StoredMessage {
    const pendingJob = this.getNextJob()
    if (pendingJob.isEmpty()) {
      throw new Error(`Can't mark job as finished. There isn't any pending job`)
    }
    return pendingJob
  }

  async createJob(
    payload: string,
    commitOptions: CommitOptions
  ): Promise<CommitInfo> {
    this.guardThatThereIsNoPendingJobs()

    const message = new NewJobMessage(payload)

    return this.commitMessage(message, commitOptions)
  }

  async markJobAsFinished(
    payload: string,
    commitOptions: CommitOptions
  ): Promise<CommitInfo> {
    const pendingJob = this.guardThatThereIsAPendingJob()

    const message = new JobFinishedMessage(payload, pendingJob.commitHash())

    return this.commitMessage(message, commitOptions)
  }

  async commitMessage(
    message: Message,
    commitOptions: CommitOptions
  ): Promise<CommitInfo> {
    const commitMessage = this.buildCommitMessage(message)
    const commitResult = await this.git.commit(
      commitMessage.forSimpleGit(),
      commitOptions.forSimpleGit()
    )
    await this.loadMessagesFromGit()
    const committedMessage = this.findStoredMessageByCommit(
      new CommitHash(commitResult.commit)
    )
    return committedMessage.commit
  }

  findStoredMessageByCommit(commitHash: CommitHash): StoredMessage {
    const commits = this.storedMessages.filter(message =>
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
