import {Nullable} from './nullable'

const NO_QUEUE_NAME = '--no-queue-name--'

export class QueueName implements Nullable {
  value: string

  constructor(value: string) {
    // TODO: validation. Issue -> https://github.com/Nautilus-Cyberneering/git-queue/issues/39
    this.value = value
  }

  isNull(): boolean {
    return this.value === NO_QUEUE_NAME
  }

  equalsTo(other: QueueName): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}

export function nullQueueName(): QueueName {
  return new QueueName(NO_QUEUE_NAME)
}
