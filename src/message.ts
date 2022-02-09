export abstract class Message {
  payload: string

  constructor(payload: string) {
    this.payload = payload
  }

  getPayload(): string {
    return this.payload
  }
}

export class NewJobMessage extends Message {}
export class JobFinishedMessage extends Message {}
