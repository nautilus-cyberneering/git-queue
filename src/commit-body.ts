export class CommitBody {
  text: string

  constructor(text: string) {
    this.text = text
  }

  toString(): string {
    return this.text
  }

  equalsTo(other: CommitBody): boolean {
    return this.text === other.text
  }
}
