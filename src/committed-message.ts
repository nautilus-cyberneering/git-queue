import {CommitInfo, nullCommitInfo} from './commit-info'
import {CommitHash} from './commit-hash'
import {CommitSubjectParser} from './commit-subject-parser'
import {InvalidMessageKeyError} from './errors'
import {Nullable} from './nullable'

export abstract class CommittedMessage implements Nullable {
  private readonly commit: CommitInfo

  constructor(commit: CommitInfo) {
    this.commit = commit
  }

  static fromCommitInfo(commit: CommitInfo): CommittedMessage {
    const messageKey = CommitSubjectParser.parseText(
      commit.message
    ).getMessageKey()
    switch (messageKey.toString()) {
      case '🈺': {
        return new NewJobCommittedMessage(commit)
      }
      case '✅': {
        return new JobFinishedCommittedMessage(commit)
      }
    }
    throw new InvalidMessageKeyError(messageKey.toString())
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

  isNull(): boolean {
    return this instanceof NullCommittedMessage
  }
}

export class NullCommittedMessage extends CommittedMessage {}
export class NewJobCommittedMessage extends CommittedMessage {}
export class JobFinishedCommittedMessage extends CommittedMessage {}

export function nullMessage(): NullCommittedMessage {
  return new NullCommittedMessage(nullCommitInfo())
}
