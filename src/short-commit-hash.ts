import {InvalidShortHash} from './errors'
import {Nullable} from './nullable'

const NO_SHORT_COMMIT_HASH = '--no-short-commit-hash--'

/**
 * 7-character commit hash
 */
export class ShortCommitHash implements Nullable {
  private value: string

  constructor(value: string) {
    if (value !== NO_SHORT_COMMIT_HASH) {
      this.validateHash(value)
    }
    this.value = value
  }

  validateHash(value: string): void {
    if (!RegExp('^[0-9a-f]{7}$').test(value)) {
      throw new InvalidShortHash(value)
    }
  }

  getHash(): string {
    return this.value
  }

  isNull(): boolean {
    return this.value === NO_SHORT_COMMIT_HASH
  }

  equalsTo(other: ShortCommitHash): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}

export function nullShortCommitHash(): ShortCommitHash {
  return new ShortCommitHash(NO_SHORT_COMMIT_HASH)
}
