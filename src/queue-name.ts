export class QueueName {
  value: string

  constructor(value: string) {
    this.value = value
  }

  isNull(): boolean {
    return this.value === ''
  }

  equalsTo(other: QueueName): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}

export function nullQueueName(): QueueName {
  return new QueueName('')
}
