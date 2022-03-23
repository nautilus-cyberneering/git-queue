import {CommitInfo, nullCommitInfo} from './commit-info'
import {CommitBody} from './commit-body'
import {CommitHash} from './commit-hash'
import {CommitSubject} from './commit-subject'
import {CommitSubjectParser} from './commit-subject-parser'
import {InvalidMessageKeyError} from './errors'
import {Nullable} from './nullable'
import {QueueName} from './queue-name'
import {ShortCommitHash} from './short-commit-hash'

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
      case '👔': {
        return new JobStartedCommittedMessage(commit)
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

  shortCommitHash(): ShortCommitHash {
    return this.commit.hash.getShortHash()
  }

  commitSubject(): CommitSubject {
    return CommitSubjectParser.parseText(this.commit.message)
  }

  payload(): string {
    return new CommitBody(this.commit.body).getPayload().trim()
  }

  isNull(): boolean {
    return this instanceof NullCommittedMessage
  }

  equalsTo(other: CommittedMessage): boolean {
    return this.commit.equalsTo(other.commitInfo())
  }

  belongsToQueue(queueName: QueueName): boolean {
    return this.commitSubject().belongsToQueue(queueName)
  }
}

export class NullCommittedMessage extends CommittedMessage {}
export class NewJobCommittedMessage extends CommittedMessage {}
export class JobFinishedCommittedMessage extends CommittedMessage {}
export class JobStartedCommittedMessage extends CommittedMessage {}

export function nullMessage(): NullCommittedMessage {
  return new NullCommittedMessage(nullCommitInfo())
}
