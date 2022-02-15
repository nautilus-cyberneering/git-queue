export class MessageKey {
  id: string

  constructor(id: string) {
    this.id = id
  }

  equalsTo(other: MessageKey): boolean {
    return this.id === other.id
  }

  toString(): string {
    return this.id
  }
}
