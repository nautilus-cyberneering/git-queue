import {CommitHash, nullCommitHash} from './commit-hash'
import {JobId} from './job-id'
import {MessageKey} from './message-key'

export abstract class Message {
  payload: string
  jobRef: CommitHash
  jobId: JobId

  constructor(
    payload: string,
    jobId: JobId,
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

  getJobId(): JobId {
    return this.jobId
  }

  hasJobRef(): boolean {
    return !this.jobRef.isNull()
  }

  hasId(): boolean {
    return !this.jobId.isNull()
  }

  abstract getKey(): MessageKey
}

export class NewJobMessage extends Message {
  constructor(payload: string, jobId: JobId) {
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
