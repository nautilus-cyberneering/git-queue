import {DefaultLogFields, GitResponseError, SimpleGit} from 'simple-git'
import {
  FINISHED_JOB_SUBJECT_PREFIX,
  NEW_JOB_SUBJECT_PREFIX,
  NewJobStoredMessage,
  StoredMessage,
  messageFactoryFromCommit,
  nullMessage
} from './stored-message'
import {JobFinishedMessage, Message, NewJobMessage} from './message'
import {Commit} from './commit'
import {CommitOptions} from './commit-options'

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
        this.commitBelongsToQueue(commit)
      )
      this.storedMessages = commits.map(commit =>
        messageFactoryFromCommit(commit)
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

  commitBelongsToQueue(commit: DefaultLogFields): boolean {
    return commit.message.endsWith(this.name) ? true : false
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

  guardThatThereIsAPendingJob(): void {
    if (this.getNextJob().isEmpty()) {
      throw new Error(`Can't mark job as done. There isn't any pending job`)
    }
  }

  async createJob(
    payload: string,
    commitOptions: CommitOptions
  ): Promise<Commit> {
    this.guardThatThereIsNoPendingJobs()

    const message = new NewJobMessage(payload)

    return this.commitMessage(message, commitOptions)
  }

  async markJobAsDone(
    payload: string,
    commitOptions: CommitOptions
  ): Promise<Commit> {
    this.guardThatThereIsAPendingJob()

    const message = new JobFinishedMessage(payload)

    return this.commitMessage(message, commitOptions)
  }

  async commitMessage(
    message: Message,
    commitOptions: CommitOptions
  ): Promise<Commit> {
    const commitMessage = this.buildCommitMessage(message)
    const commitResult = await this.git.commit(
      commitMessage,
      commitOptions.forSimpleGit()
    )
    await this.loadMessagesFromGit()
    return new Commit(commitResult.commit)
  }

  buildCommitMessage(message: Message): string[] {
    const commitSubject = this.buildCommitSubject(message)

    const commitBody = message.getPayload()

    const commitMessage = [commitSubject, commitBody]

    return commitMessage
  }

  buildCommitSubject(message: Message): string {
    let commitSubject: string
    if (message instanceof NewJobMessage) {
      commitSubject = `${NEW_JOB_SUBJECT_PREFIX}${this.name}`
    } else if (message instanceof JobFinishedMessage) {
      commitSubject = `${FINISHED_JOB_SUBJECT_PREFIX}${this.name}`
    } else {
      throw Error(`Invalid Message type: ${typeof message}`)
    }
    return commitSubject
  }
}
