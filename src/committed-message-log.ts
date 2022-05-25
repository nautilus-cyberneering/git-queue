import {
  CommittedMessage,
  JobFinishedCommittedMessage,
  JobStartedCommittedMessage,
  NewJobCommittedMessage,
  nullMessage
} from './committed-message'
import {DefaultLogFields, ListLogLine} from 'simple-git'

import {CommitHash} from './commit-hash'
import {CommitInfo} from './commit-info'
import {JobId, nullJobId} from './job-id'
import {QueueName} from './queue-name'

import {commitSubjectBelongsToAQueue} from './commit-subject-parser'
import {Job} from './job'

/**
 * A readonly list of ordered commit messages.
 * A memory version of `git log` command containing only queue commits.
 */
export class CommittedMessageLog {
  private readonly messages: readonly CommittedMessage[]

  private constructor(messages: readonly CommittedMessage[]) {
    this.messages = messages
  }

  private static filterQueueCommits(
    commits: readonly (DefaultLogFields & ListLogLine)[]
  ): readonly (DefaultLogFields & ListLogLine)[] {
    return commits.filter(commit =>
      commitSubjectBelongsToAQueue(commit.message)
    )
  }

  static fromGitLogCommits(
    allCommits: readonly (DefaultLogFields & ListLogLine)[]
  ): CommittedMessageLog {
    const onlyQueueCommits = this.filterQueueCommits(allCommits)

    const committedMessages = onlyQueueCommits.map(commit =>
      CommittedMessage.fromCommitInfo(CommitInfo.fromDefaultLogFields(commit))
    )

    return new CommittedMessageLog(committedMessages)
  }

  getMessages(): readonly CommittedMessage[] {
    return this.messages
  }

  isEmpty(): boolean {
    return this.messages.length === 0
  }

  getLatestMessage(): CommittedMessage {
    return this.isEmpty() ? nullMessage() : this.messages[0]
  }

  getNextToLatestMessage(): CommittedMessage {
    if (this.messages.length < 2) {
      return nullMessage()
    }

    return this.messages[1]
  }

  getLatestMessageRelatedToJob(jobId: JobId): CommittedMessage {
    return this.isEmpty()
      ? nullMessage()
      : this.messages.find(message => message.jobId().equalsTo(jobId)) ||
          nullMessage()
  }

  getLatestNewJobMessage(): CommittedMessage {
    return this.isEmpty()
      ? nullMessage()
      : this.messages.find(
          message => message instanceof NewJobCommittedMessage
        ) || nullMessage()
  }

  // TO-DO: Test this
  jobIsPending(jobId: JobId): boolean {
    return (
      this.getLatestMessageRelatedToJob(jobId) instanceof NewJobCommittedMessage
    )
  }

  // TO-DO: Test this
  getOldestPendingJob(): JobId {
    for (let index = this.messages.length - 1; index >= 0; index--) {
      if (
        this.messages[index] instanceof NewJobCommittedMessage &&
        this.jobIsPending(this.messages[index].jobId())
      ) {
        return this.messages[index].jobId()
      }
    }
    return nullJobId()
  }

  getLatestFinishedJobMessage(): CommittedMessage {
    return this.isEmpty()
      ? nullMessage()
      : this.messages.find(
          message => message instanceof JobFinishedCommittedMessage
        ) || nullMessage()
  }

  getLatestStartedJobMessage(): CommittedMessage {
    return this.isEmpty()
      ? nullMessage()
      : this.messages.find(
          message => message instanceof JobStartedCommittedMessage
        ) || nullMessage()
  }

  getJobCreationMessage(jobId: JobId): CommittedMessage {
    return this.isEmpty()
      ? nullMessage()
      : this.messages.find(
          message =>
            message instanceof NewJobCommittedMessage &&
            Job.fromCommittedMessage(message).getJobId().equalsTo(jobId)
        ) || nullMessage()
  }

  findByCommitHash(commitHash: CommitHash): CommittedMessage {
    const commits = this.messages.filter(message =>
      message.commitHash().equalsTo(commitHash)
    )

    if (commits.length === 0) {
      return nullMessage()
    }

    return commits[0]
  }

  filterCommitsByQueue(queueName: QueueName): CommittedMessageLog {
    const filteredMessages = this.messages.filter(committedMessage =>
      committedMessage.belongsToQueue(queueName)
    )
    return new CommittedMessageLog(filteredMessages)
  }
}
