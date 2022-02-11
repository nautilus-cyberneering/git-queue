import {Message} from './message'

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
    queueName: string
  ): CommitSubject {
    const messageKey = message.getKey()

    let jobRefPart = ''

    if (message.hasJobRef()) {
      jobRefPart = `${COMMIT_SUBJECT_DELIMITER} ${COMMIT_SUBJECT_JOB_REF_PREFIX}${message.getJobRef()}`
    }

    const commitSubject = `${COMMIT_SUBJECT_PREFIX}${messageKey}${COMMIT_SUBJECT_DELIMITER} ${queueName}${jobRefPart}`

    return new CommitSubject(commitSubject)
  }

  toString(): string {
    return this.text
  }

  equalsTo(other: CommitSubject): boolean {
    return this.text === other.text
  }

  belongsToQueue(queueName: string): boolean {
    return this.getQueueName() === queueName
  }

  getQueueName(): string {
    const parts = this.text.split(COMMIT_SUBJECT_DELIMITER)
    return parts[1].trim()
  }

  getMessageKey(): string {
    const queuePrefix = this.text.indexOf(COMMIT_SUBJECT_PREFIX)
    const colonPos = this.text.indexOf(COMMIT_SUBJECT_DELIMITER)
    return this.text.substring(
      queuePrefix + COMMIT_SUBJECT_PREFIX.length,
      colonPos
    )
  }

  getJobRef(): string {
    const queuePrefix = this.text.indexOf(COMMIT_SUBJECT_JOB_REF_PREFIX)
    return this.text.substring(
      queuePrefix + COMMIT_SUBJECT_JOB_REF_PREFIX.length
    )
  }
}
