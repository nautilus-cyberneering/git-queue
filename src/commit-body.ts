import {Message} from './message'

export class CommitBody {
  text: string

  constructor(text: string) {
    this.text = text
  }

  static fromMessage(message: Message): CommitBody {
    return new CommitBody(message.getPayload())
  }

  toString(): string {
    return this.text
  }

  equalsTo(other: CommitBody): boolean {
    return this.text === other.text
  }
}
