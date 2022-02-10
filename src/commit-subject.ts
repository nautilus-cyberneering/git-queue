import {Message} from './message'

const COMMIT_SUBJECT_PREFIX = '📝'
const COMMIT_SUBJECT_DELIMITER = ':'

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
    const commitSubject = `${COMMIT_SUBJECT_PREFIX}${messageKey}${COMMIT_SUBJECT_DELIMITER} ${queueName}`
    return new CommitSubject(commitSubject)
  }

  toString(): string {
    return this.text
  }

  equalsTo(other: CommitSubject): boolean {
    return this.text === other.text
  }

  belongsToQueue(queName: string): boolean {
    return this.text.endsWith(queName) ? true : false
  }

  getMessageKey(): string {
    const queuePrefix = this.text.indexOf(COMMIT_SUBJECT_PREFIX)
    const colonPos = this.text.indexOf(COMMIT_SUBJECT_DELIMITER)
    return this.text.substring(
      queuePrefix + COMMIT_SUBJECT_PREFIX.length,
      colonPos
    )
  }
}
