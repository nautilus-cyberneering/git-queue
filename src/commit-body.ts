import Ajv, {JTDParser, JTDSchemaType} from 'ajv/dist/jtd'
import {InvalidCommitBodyError} from './errors'
import {Message} from './message'

interface CommitBodyMetaData {
  version: number
}

interface CommitBodyData {
  metadata?: CommitBodyMetaData
  payload: string
}

const CommitBodySchema: JTDSchemaType<CommitBodyData> = {
  properties: {
    payload: {type: 'string'}
  },
  optionalProperties: {
    metadata: {
      properties: {
        version: {type: 'int32'}
      },
      additionalProperties: true
    }
  }
}

export class CommitBody {
  body: CommitBodyData
  private static parse: JTDParser<CommitBodyData> = new Ajv().compileParser(
    CommitBodySchema
  )

  constructor(text: string) {
    this.body = this.getParsedBodyData(text)
  }

  static fromMessage(message: Message): CommitBody {
    return new CommitBody(`{ "payload" : "${message.getPayload()}" }`)
  }

  getParsedBodyData(text): CommitBodyData {
    const parsedBody = CommitBody.parse(text)
    if (this.isCommitBodyData(parsedBody)) {
      return parsedBody
    } else {
      throw new InvalidCommitBodyError(text)
    }
  }

  isCommitBodyData(
    object: CommitBodyData | undefined
  ): object is CommitBodyData {
    return typeof object != 'undefined'
  }

  toString(): string {
    return JSON.stringify(this.body)
  }

  getPayload(): string {
    return this.body?.payload
  }

  equalsTo(other: CommitBody): boolean {
    return JSON.stringify(this.body) === JSON.stringify(other.body)
  }
}
