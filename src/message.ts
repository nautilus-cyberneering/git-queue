import {CommitHash, nullCommitHash} from './commit-hash'
import {MessageKey} from './message-key'
import {NO_JOB_ID} from './job'

export abstract class Message {
  payload: string
  jobRef: CommitHash
  id: Number

  constructor(
    payload: string,
    jobRef: CommitHash = nullCommitHash(),
    id = NO_JOB_ID
  ) {
    this.payload = payload
    this.jobRef = jobRef
    this.id = id
  }

  getPayload(): string {
    return this.payload
  }

  getJobRef(): CommitHash {
    return this.jobRef
  }

  getId(): Number {
    return this.id
  }

  hasJobRef(): boolean {
    return !this.jobRef.isNull()
  }

  hasId(): boolean {
    return this.id !== NO_JOB_ID
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
