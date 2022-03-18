import Ajv, {JTDSchemaType} from 'ajv/dist/jtd'
import {Message} from './message'

interface CommitBodyData {
  payload: string
}

const CommitBodySchema: JTDSchemaType<CommitBodyData> = {
  properties: {
    payload: {type: 'string'}
  }
}

export class CommitBody {
  text: string

  constructor(text: string) {
    this.guardThatTextCompliesWithSchema(text)
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

  guardThatTextCompliesWithSchema(text): void {
    const ajv = new Ajv()
    const parse = ajv.compileParser(CommitBodySchema)
    if (!parse(text)) {
      throw new Error(`Schema not validated:${text}`)
    }
  }
}
