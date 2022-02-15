import {Nullable} from './nullable'

export class CommitHash implements Nullable {
  value: string

  constructor(value: string) {
    // TODO: validation
    this.value = value
  }

  getHash(): string {
    return this.value
  }

  isNull(): boolean {
    return this.value === ''
  }

  equalsTo(other: CommitHash): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}

export function nullCommitHash(): CommitHash {
  return new CommitHash('')
}
