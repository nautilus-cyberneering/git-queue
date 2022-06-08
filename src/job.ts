import {CommitHash, nullCommitHash} from './commit-hash'
import {JobId, nullJobId} from './job-id'
import {NewJobCommittedMessage} from './committed-message'
import {Nullable} from './nullable'

const NO_JOB = '--no-job--'

export enum JobState {
  New = 'new',
  Started = 'started',
  Finished = 'finished'
}

export class Job implements Nullable {
  private payload: string
  private commitHash: CommitHash
  private jobId: JobId
  private state: JobState

  constructor(
    payload: string,
    commitHash: CommitHash,
    jobId: JobId,
    state: JobState = JobState.New
  ) {
    this.payload = payload
    this.commitHash = commitHash
    this.jobId = jobId
    this.state = state
  }

  static fromNewJobCommittedMessage(
    newJobCommittedMessage: NewJobCommittedMessage,
    state: JobState = JobState.New
  ): Job {
    return new Job(
      newJobCommittedMessage.payload(),
      newJobCommittedMessage.commitHash(),
      newJobCommittedMessage.jobId(),
      state
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

  isNew(): boolean {
    return this.state === JobState.New
  }

  isStarted(): boolean {
    return this.state === JobState.Started
  }

  isFinished(): boolean {
    return this.state === JobState.Finished
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
