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

export class PendingJobsLimitReachedError extends Error {
  constructor(commitHash: string) {
    super(
      `Can't create a new job. There is already a pending job in commit: ${commitHash}`
    )
    Object.setPrototypeOf(this, PendingJobsLimitReachedError.prototype)
  }
}

export class NoPendingJobsFoundError extends Error {
  constructor(queueName: string) {
    super(
      `Can't mark job as finished. There isn't any pending job in queue: ${queueName}`
    )
    Object.setPrototypeOf(this, NoPendingJobsFoundError.prototype)
  }
}
