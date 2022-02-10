export abstract class Message {
  payload: string

  constructor(payload: string) {
    this.payload = payload
  }

  getPayload(): string {
    return this.payload
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
