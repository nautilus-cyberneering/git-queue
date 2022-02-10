export class CommitSubject {
  text: string

  constructor(text: string) {
    this.text = text
  }

  toString(): string {
    return this.text
  }

  equalsTo(other: CommitSubject): boolean {
    return this.text === other.text
  }

  belongsToQueue(queName: string): boolean {
    return this.text.endsWith(queName) ? true : false
  }
}
