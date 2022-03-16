import {CommitInfo, nullCommitInfo} from './commit-info'
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
    /*
      PROBLEMA:
      En diversos tests (should allow to sign commits), se llega aquí con el siguiente
      commit message: 🈺: QUEUE_NAME, con lo que falla pillar el job ref dentro de parse text
      y hace petar el constructor de CommitHash
      Entiendo que tal vez el parse Text, en el caso de que no encuentre el prefijo de Job Ref,
      debería poner Hash nulo


      ----> Añadir el test cuando se parsea un subject sin job ref, y en la implementación
            del getJobRef devolver hash nulo si no hay jobref
    */
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
    return this.commit.body.trim()
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
