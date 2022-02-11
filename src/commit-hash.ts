export class CommitHash {
  value: string

  constructor(value: string) {
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
