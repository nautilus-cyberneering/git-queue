import {Message} from './message'
import {MessageKey} from './message-key'
import {QueueName} from './queue-name'

const COMMIT_SUBJECT_PREFIX = '📝'
const COMMIT_SUBJECT_DELIMITER = ':'
const COMMIT_SUBJECT_JOB_REF_PREFIX = 'job.ref.'

/* The first line of a commit message.
 * Format: {COMMIT_SUBJECT_PREFIX}{MESSAGE_KEY}: {QUEUE_NAME}: job.ref.{COMMIT_HASH}
 * Example: 📝✅: queue_name: job.ref.1e31b549c630f806961a291b4e3d4a1471f37490
 */
export class CommitSubject {
  text: string

  constructor(text: string) {
    // TODO: validation
    this.text = text
  }

  static fromMessageAndQueueName(
    message: Message,
    queueName: QueueName
  ): CommitSubject {
    const messageKey = message.getKey()

    let jobRefPart = ''

    if (message.hasJobRef()) {
      jobRefPart = `${COMMIT_SUBJECT_DELIMITER} ${COMMIT_SUBJECT_JOB_REF_PREFIX}${message.getJobRef()}`
    }

    const commitSubject = `${COMMIT_SUBJECT_PREFIX}${messageKey.toString()}${COMMIT_SUBJECT_DELIMITER} ${queueName.toString()}${jobRefPart}`

    return new CommitSubject(commitSubject)
  }

  static belongsToAnyQueue(subject: string): boolean {
    return subject.startsWith(COMMIT_SUBJECT_PREFIX)
  }

  toString(): string {
    return this.text
  }

  equalsTo(other: CommitSubject): boolean {
    return this.text === other.text
  }

  belongsToQueue(queueName: QueueName): boolean {
    return this.getQueueName().equalsTo(queueName)
  }

  getQueueName(): QueueName {
    const parts = this.text.split(COMMIT_SUBJECT_DELIMITER)
    // TODO: We assume there is always a queue name although the constructor validation is not done yet.
    return new QueueName(parts[1].trim())
  }

  getMessageKey(): MessageKey {
    const queuePrefix = this.text.indexOf(COMMIT_SUBJECT_PREFIX)
    const colonPos = this.text.indexOf(COMMIT_SUBJECT_DELIMITER)
    return new MessageKey(
      this.text.substring(queuePrefix + COMMIT_SUBJECT_PREFIX.length, colonPos)
    )
  }

  getJobRef(): string {
    const queuePrefix = this.text.indexOf(COMMIT_SUBJECT_JOB_REF_PREFIX)
    return this.text.substring(
      queuePrefix + COMMIT_SUBJECT_JOB_REF_PREFIX.length
    )
  }
}
