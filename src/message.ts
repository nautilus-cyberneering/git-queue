import {CommitHash, nullCommitHash} from './commit-hash'

export abstract class Message {
  payload: string
  jobRef: CommitHash

  constructor(payload: string, jobRef: CommitHash = nullCommitHash()) {
    this.payload = payload
    this.jobRef = jobRef
  }

  getPayload(): string {
    return this.payload
  }

  getJobRef(): CommitHash {
    return this.jobRef
  }

  hasJobRef(): boolean {
    return !this.jobRef.isNull()
  }

  // The key is an unique identifier for the message
  abstract getKey(): string
}

export class NewJobMessage extends Message {
  getKey(): string {
    return '🈺'
  }
}

export class JobFinishedMessage extends Message {
  getKey(): string {
    return '✅'
  }
}
