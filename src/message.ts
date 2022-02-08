export abstract class Message {
  payload: string

  constructor(payload: string) {
    this.payload = payload
  }

  getPayload(): string {
    return this.payload
  }
}

export class CreateJobMessage extends Message {}
export class MarkJobAsDoneMessage extends Message {}
