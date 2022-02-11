export abstract class Message {
  payload: string
  jobRef: string

  constructor(payload: string, jobRef = '') {
    this.payload = payload
    this.jobRef = jobRef
  }

  getPayload(): string {
    return this.payload
  }

  getJobRef(): string {
    return this.jobRef
  }

  hasJobRef(): boolean {
    return this.jobRef !== ''
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
