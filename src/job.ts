import {CommitHash, nullCommitHash} from './commit-hash'
import {NewJobCommittedMessage} from './committed-message'
import {Nullable} from './nullable'

const NO_JOB = '--no-job--'
export const NO_JOB_ID = -1

export class Job implements Nullable {
  private payload: string
  private commitHash: CommitHash
  private id: Number

  constructor(payload: string, commitHash: CommitHash, id: Number) {
    this.payload = payload
    this.commitHash = commitHash
    this.id = id
  }

  static fromCommittedMessage(
    newJobCommittedMessage: NewJobCommittedMessage
  ): Job {
    return new Job(
      newJobCommittedMessage.payload(),
      newJobCommittedMessage.commitHash(),
      newJobCommittedMessage.jobId()
    )
  }

  getPayload(): string {
    return this.payload
  }

  getCommitHash(): CommitHash {
    return this.commitHash
  }

  getId(): Number {
    return this.id
  }

  isNull(): boolean {
    return this.payload === NO_JOB && this.commitHash.isNull()
  }

  equalsTo(other: Job): boolean {
    return (
      this.payload === other.getPayload() &&
      this.commitHash.equalsTo(other.getCommitHash()) &&
      this.id === other.id
    )
  }
}

export function nullJob(): Job {
  return new Job(NO_JOB, nullCommitHash(), NO_JOB_ID)
}
