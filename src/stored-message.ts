import {CommitInfo, nullCommitInfo} from './commit-info'
import {CommitHash} from './commit-hash'
import {CommitSubject} from './commit-subject'

export abstract class StoredMessage {
  commit: CommitInfo

  constructor(commit: CommitInfo) {
    this.commit = commit
  }

  static fromCommitInfo(commit: CommitInfo): StoredMessage {
    const messageKey = new CommitSubject(commit.message).getMessageKey()
    switch (messageKey.toString()) {
      case '🈺': {
        return new NewJobStoredMessage(commit)
      }
      case '✅': {
        return new JobFinishedStoredMessage(commit)
      }
    }
    throw new Error(`Invalid message key: ${messageKey}`)
  }

  commitInfo(): CommitInfo {
    return this.commit
  }

  commitHash(): CommitHash {
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
