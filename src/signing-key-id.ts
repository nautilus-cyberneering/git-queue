export class SigningKeyId {
  id: string

  constructor(id: string) {
    this.id = id
  }

  toString() {
    return this.id
  }

  isEmpty() {
    return this.id == ''
  }
}

export function emptySigningKeyId() {
  return new SigningKeyId('')
}
