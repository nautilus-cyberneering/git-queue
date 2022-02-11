import {CommitInfo, nullCommitInfo} from './commit-info'
import {CommitHash} from './commit-hash'
import {CommitSubject} from './commit-subject'

export abstract class CommittedMessage {
  commit: CommitInfo

  constructor(commit: CommitInfo) {
    this.commit = commit
  }

  static fromCommitInfo(commit: CommitInfo): CommittedMessage {
    const messageKey = new CommitSubject(commit.message).getMessageKey()
    switch (messageKey.toString()) {
      case '🈺': {
        return new NewJobCommittedMessage(commit)
      }
      case '✅': {
        return new JobFinishedCommittedMessage(commit)
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
    return this instanceof NullCommittedMessage
  }
}

export class NullCommittedMessage extends CommittedMessage {}
export class NewJobCommittedMessage extends CommittedMessage {}
export class JobFinishedCommittedMessage extends CommittedMessage {}

export function nullMessage(): NullCommittedMessage {
  return new NullCommittedMessage(nullCommitInfo())
}
