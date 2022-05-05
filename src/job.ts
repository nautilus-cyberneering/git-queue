import {CommitHash, nullCommitHash} from './commit-hash'
import {JobId, nullJobId} from './job-id'
import {NewJobCommittedMessage} from './committed-message'
import {Nullable} from './nullable'

const NO_JOB = '--no-job--'

export class Job implements Nullable {
  private payload: string
  private commitHash: CommitHash
  private jobId: JobId

  constructor(payload: string, commitHash: CommitHash, jobId: JobId) {
    this.payload = payload
    this.commitHash = commitHash
    this.jobId = jobId
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

  getJobId(): JobId {
    return this.jobId
  }

  isNull(): boolean {
    return this.payload === NO_JOB && this.commitHash.isNull()
  }

  equalsTo(other: Job): boolean {
    return (
      this.payload === other.getPayload() &&
      this.commitHash.equalsTo(other.getCommitHash()) &&
      this.jobId.equalsTo(other.getJobId())
    )
  }
}

export function nullJob(): Job {
  return new Job(NO_JOB, nullCommitHash(), nullJobId())
}
