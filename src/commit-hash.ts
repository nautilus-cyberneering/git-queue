import {Nullable} from './nullable'
import {ShortCommitHash} from './short-commit-hash'

const NO_COMMIT_HASH = '--no-commit-hash--'

export class CommitHash implements Nullable {
  private value: string

  constructor(value: string) {
    // TODO: validation
    this.value = value
  }

  getHash(): string {
    return this.value
  }

  getShortHash(): ShortCommitHash {
    return new ShortCommitHash(this.value.substring(0, 7))
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
