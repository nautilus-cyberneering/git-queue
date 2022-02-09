import {DefaultLogFields} from 'simple-git'
import {nullCommit} from './commit'

export const CREATE_JOB_SUBJECT_PREFIX = 'CLAIM LOCK: JOB: '
export const MARK_JOB_AS_DONE_SUBJECT_PREFIX = 'RELEASE LOCK: JOB DONE: '

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

export function nullMessage(): NullStoredMessage {
  return new NullStoredMessage(nullCommit())
}

export function messageFactoryFromCommit(
  commit: DefaultLogFields
): StoredMessage {
  const commitSubject = commit.message

  if (commitSubject.startsWith(CREATE_JOB_SUBJECT_PREFIX)) {
    return new NewJobStoredMessage(commit)
  }

  if (commitSubject.startsWith(MARK_JOB_AS_DONE_SUBJECT_PREFIX)) {
    return new JobFinishedStoredMessage(commit)
  }

  throw new Error(`Queue message not found in commit: ${commit.hash}`)
}
