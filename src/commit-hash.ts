import {InvalidHashError} from './errors'
import {Nullable} from './nullable'

const NO_COMMIT_HASH = '--no-commit-hash--'

export class CommitHash implements Nullable {
  private value: string

  constructor(value: string) {
    if (value !== NO_COMMIT_HASH) {
      this.guardThatHashValueIsValid(value)
    }
    this.value = value
  }

  guardThatHashValueIsValid(value: string): void {
    if (!RegExp('^[0-9a-f]{40}$').test(value)) {
      throw new InvalidHashError(value)
    }
  }

  getHash(): string {
    return this.value
  }

  isNull(): boolean {
    return this.value === NO_COMMIT_HASH
  }

  equalsTo(other: CommitHash): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}

export function nullCommitHash(): CommitHash {
  return new CommitHash(NO_COMMIT_HASH)
}
