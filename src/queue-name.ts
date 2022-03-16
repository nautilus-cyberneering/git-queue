import {Nullable} from './nullable'
import {QueueNameNotValidError} from './errors'

const NO_QUEUE_NAME = '--no-queue-name--'

export class QueueName implements Nullable {
  value: string

  constructor(value: string) {
    this.guardThatNameIsValid(value)
    this.value = this.convertSpacesToDashes(value)
  }

  isNull(): boolean {
    return this.value === NO_QUEUE_NAME
  }

  equalsTo(other: QueueName): boolean {
    return this.value === other.value
  }

  guardThatNameIsValid(value): void {
    if (!RegExp('^[a-z-_ ]{1,50}$').test(value)) {
      throw new QueueNameNotValidError(value)
    }
  }

  convertSpacesToDashes(value): string {
    return value.replace(/ /g, '-')
  }

  toString(): string {
    return this.value
  }
}

export function nullQueueName(): QueueName {
  return new QueueName(NO_QUEUE_NAME)
}
