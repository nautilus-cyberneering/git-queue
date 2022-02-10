import {DefaultLogFields} from 'simple-git'

export const NEW_JOB_SUBJECT_PREFIX = '📝🈺: '
export const FINISHED_JOB_SUBJECT_PREFIX = '📝✅: '

// TODO: Code Review: should be only use our own class Commit?
// We are exposing the class Commit in the main module and using DefaultLogFields internally.
// We can keep doing that but we should rename "nullCommit()" function to "emptyDefaultLogFields()".

export abstract class StoredMessage {
  commit: DefaultLogFields

  constructor(commit: DefaultLogFields) {
    this.commit = commit
  }

  commitHash(): string {
    return this.commit.hash
  }

  payload(): string {
    return this.commit.body.trim()
  }

  isEmpty(): boolean {
    return this instanceof NullStoredMessage
  }
}

export class NullStoredMessage extends StoredMessage {}
export class NewJobStoredMessage extends StoredMessage {}
export class JobFinishedStoredMessage extends StoredMessage {}

export function nullCommit(): DefaultLogFields {
  return {
    hash: '',
    date: '',
    message: '',
    refs: '',
    body: '',
    author_name: '',
    author_email: ''
  }
}

export function nullMessage(): NullStoredMessage {
  return new NullStoredMessage(nullCommit())
}

export function messageFactoryFromCommit(
  commit: DefaultLogFields
): StoredMessage {
  const commitSubject = commit.message

  if (commitSubject.startsWith(NEW_JOB_SUBJECT_PREFIX)) {
    return new NewJobStoredMessage(commit)
  }

  if (commitSubject.startsWith(FINISHED_JOB_SUBJECT_PREFIX)) {
    return new JobFinishedStoredMessage(commit)
  }

  throw new Error(`Queue message not found in commit: ${commit.hash}`)
}
