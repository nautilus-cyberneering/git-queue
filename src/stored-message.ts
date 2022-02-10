import {CommitInfo, nullCommitInfo} from './commit-info'

export const NEW_JOB_SUBJECT_PREFIX = '📝🈺: '
export const FINISHED_JOB_SUBJECT_PREFIX = '📝✅: '

export abstract class StoredMessage {
  commit: CommitInfo

  constructor(commit: CommitInfo) {
    this.commit = commit
  }

  commitInfo(): CommitInfo {
    return this.commit
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
  return new NullStoredMessage(nullCommitInfo())
}

export function messageFactoryFromCommitInfo(
  commit: CommitInfo
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
