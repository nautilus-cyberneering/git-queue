import {CommitHash, nullCommitHash} from './commit-hash'
import {NewJobCommittedMessage} from './committed-message'
import {Nullable} from './nullable'

const NO_JOB = '--no-job--'

export class Job implements Nullable {
  private payload: string
  private commitHash: CommitHash

  constructor(payload: string, commitHash: CommitHash) {
    this.payload = payload
    this.commitHash = commitHash
  }

  static fromCommittedMessage(
    newJobCommittedMessage: NewJobCommittedMessage
  ): Job {
    return new Job(
      newJobCommittedMessage.payload(),
      newJobCommittedMessage.commitHash()
    )
  }

  getPayload(): string {
    return this.payload
  }

  getCommitHash(): CommitHash {
    return this.commitHash
  }

  isNull(): boolean {
    return this.payload === NO_JOB && this.commitHash.isNull()
  }

  equalsTo(other: Job): boolean {
    return (
      this.payload === other.getPayload() &&
      this.commitHash.equalsTo(other.getCommitHash())
    )
  }
}

export function nullJob(): Job {
  return new Job(NO_JOB, nullCommitHash())
}
