export class SigningKeyId {
  id: string

  constructor(id: string) {
    this.id = id
  }

  equalsTo(other: SigningKeyId): boolean {
    return this.id === other.id
  }

  toString(): string {
    return this.id
  }

  isEmpty(): boolean {
    return this.id === ''
  }
}

export function emptySigningKeyId(): SigningKeyId {
  return new SigningKeyId('')
}
