import {CommitHash} from './commit-hash'
import {CommitSubjectParser} from './commit-subject-parser'
import {Message} from './message'
import {MessageKey} from './message-key'
import {QueueName} from './queue-name'

/* The first line of a commit message.
 * Format: {COMMIT_SUBJECT_PREFIX}{MESSAGE_KEY}: {QUEUE_NAME}: job.ref.{COMMIT_HASH}
 * Example: 📝✅: queue_name: job.ref.1e31b549c630f806961a291b4e3d4a1471f37490
 */
export class CommitSubject {
  private messageKey: MessageKey
  private queueName: QueueName
  private jobRef: CommitHash

  constructor(
    messageKey: MessageKey,
    queueName: QueueName,
    jobRef: CommitHash
  ) {
    this.messageKey = messageKey
    this.queueName = queueName
    this.jobRef = jobRef
  }

  static fromMessageAndQueueName(
    message: Message,
    queueName: QueueName
  ): CommitSubject {
    return new CommitSubject(message.getKey(), queueName, message.getJobRef())
  }

  toString(): string {
    return CommitSubjectParser.toText(this)
  }

  equalsTo(other: CommitSubject): boolean {
    return this.toString() === other.toString()
  }

  belongsToQueue(queueName: QueueName): boolean {
    return this.queueName.equalsTo(queueName)
  }

  getMessageKey(): MessageKey {
    return this.messageKey
  }

  getQueueName(): QueueName {
    return this.queueName
  }

  getJobRef(): CommitHash {
    return this.jobRef
  }
}
