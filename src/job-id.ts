import {Nullable} from './nullable'
import {InvalidJobIdError} from './errors'

const NO_JOB_ID = -1

export class JobId implements Nullable {
  private value: number

  constructor(value: number) {
    if (value !== NO_JOB_ID) {
      this.guardThatIdValueIsValid(value)
    }
    this.value = value
  }

  guardThatIdValueIsValid(value: number): void {
    if (isNaN(value) || value < 0) {
      throw new InvalidJobIdError(value)
    }
  }

  getId(): number {
    return this.value
  }

  getNextConsecutiveJobId(): JobId {
    return this.isNull() ? new JobId(1) : new JobId(this.value + 1)
  }

  isNull(): boolean {
    return this.value === NO_JOB_ID
  }

  equalsTo(other: JobId): boolean {
    return this.value === other.value
  }

  toString(): string {
    return `${this.value}`
  }
}

export function nullJobId(): JobId {
  return new JobId(NO_JOB_ID)
}
