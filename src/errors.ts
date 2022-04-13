import {CommittedMessage} from './committed-message'
import {MAX_QUEUE_NAME_LENGTH} from './queue-name'

export class MissingQueueNameInCommitSubjectError extends Error {
  constructor(commitSubject: string) {
    super(`Missing queue name in commit subject: ${commitSubject}`)
    Object.setPrototypeOf(this, MissingQueueNameInCommitSubjectError.prototype)
  }
}

export class MissingMessageKeyInCommitSubjectError extends Error {
  constructor(commitSubject: string) {
    super(`Missing message key in commit subject: ${commitSubject}`)
    Object.setPrototypeOf(this, MissingMessageKeyInCommitSubjectError.prototype)
  }
}

export class MissingCommitHashInJobReferenceError extends Error {
  constructor(commitSubject: string) {
    super(
      `Missing commit hash in job reference in commit subject: ${commitSubject}`
    )
    Object.setPrototypeOf(this, MissingMessageKeyInCommitSubjectError.prototype)
  }
}

export class InvalidMessageKeyError extends Error {
  constructor(messageKey: string) {
    super(`Invalid message key: ${messageKey}`)
    Object.setPrototypeOf(this, InvalidMessageKeyError.prototype)
  }
}

export class GitDirNotInitializedError extends Error {
  constructor(dir: string) {
    super(`Git dir: ${dir} has not been initialized`)
    Object.setPrototypeOf(this, GitDirNotInitializedError.prototype)
  }
}

export class GitDirNotFoundError extends Error {
  constructor(dir: string) {
    super(`Git dir: ${dir} does not exist or is not reachable`)
    Object.setPrototypeOf(this, GitDirNotFoundError.prototype)
  }
}

export class PendingJobsLimitReachedError extends Error {
  constructor(committedMessage: CommittedMessage) {
    super(
      `Can't create job. Previous message is not a job finished message. Previous message commit: ${committedMessage
        .commitHash()
        .toString()}`
    )
    Object.setPrototypeOf(this, PendingJobsLimitReachedError.prototype)
  }
}

export class MissingJobStartedMessageError extends Error {
  constructor(committedMessage: CommittedMessage) {
    super(
      `Can't finish job. Previous message is not a job started message. Previous message commit: ${committedMessage
        .commitHash()
        .toString()}`
    )
    Object.setPrototypeOf(this, MissingJobStartedMessageError.prototype)
  }
}

export class MissingNewJobMessageError extends Error {
  constructor(committedMessage: CommittedMessage) {
    super(
      `Can't start job. Previous message is not a new job message. Previous message commit: ${committedMessage
        .commitHash()
        .toString()}`
    )
    Object.setPrototypeOf(this, MissingNewJobMessageError.prototype)
  }
}

export class QueueNameNotValidError extends Error {
  constructor(queueName: string) {
    super(
      `Queue name not valid: ${queueName}.\n` +
        `Only lowercase letters (a-z), dash and white space are allowed,` +
        ` ${MAX_QUEUE_NAME_LENGTH} characters max.`
    )
    Object.setPrototypeOf(this, MissingNewJobMessageError.prototype)
  }
}

export class InvalidHashError extends Error {
  constructor(hash: string) {
    super(`Invalid SHA-1 commit hash: ${hash}`)
    Object.setPrototypeOf(this, InvalidHashError.prototype)
  }
}

export class InvalidShortHashError extends Error {
  constructor(hash: string) {
    super(`Invalid 7-characters SHA-1 commit hash: ${hash}`)
    Object.setPrototypeOf(this, InvalidShortHashError.prototype)
  }
}

export class InvalidCommitBodyError extends Error {
  constructor(invalidBodyContent: string) {
    super(
      `Commit Body does not conform to specification: ${invalidBodyContent}`
    )
    Object.setPrototypeOf(this, InvalidCommitBodyError.prototype)
  }
}
