import {CommitHash, nullCommitHash} from './commit-hash'
import {MessageKey} from './message-key'
import {NO_JOB_ID} from './job'

export abstract class Message {
  payload: string
  jobRef: CommitHash
  jobId: number

  constructor(
    payload: string,
    jobId: number,
    jobRef: CommitHash = nullCommitHash()
  ) {
    this.payload = payload
    this.jobId = jobId
    this.jobRef = jobRef
  }

  getPayload(): string {
    return this.payload
  }

  getJobRef(): CommitHash {
    return this.jobRef
  }

  getId(): number {
    return this.jobId
  }

  hasJobRef(): boolean {
    return !this.jobRef.isNull()
  }

  hasId(): boolean {
    return this.jobId !== NO_JOB_ID
  }

  abstract getKey(): MessageKey
}

export class NewJobMessage extends Message {
  constructor(payload: string, jobId: number) {
    super(payload, jobId, nullCommitHash())
  }

  getKey(): MessageKey {
    return new MessageKey('🈺')
  }
}

export class JobFinishedMessage extends Message {
  getKey(): MessageKey {
    return new MessageKey('✅')
  }
}

export class JobStartedMessage extends Message {
  getKey(): MessageKey {
    return new MessageKey('👔')
  }
}
