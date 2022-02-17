import {CommitHash, nullCommitHash} from './commit-hash'
import {MessageKey} from './message-key'

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

  abstract getKey(): MessageKey
}

export class NewJobMessage extends Message {
  constructor(payload: string) {
    super(payload, nullCommitHash())
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
