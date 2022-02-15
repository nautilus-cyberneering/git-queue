import {Nullable} from './nullable'

export class SigningKeyId implements Nullable {
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

  isNull(): boolean {
    return this.id === ''
  }
}

export function nullSigningKeyId(): SigningKeyId {
  return new SigningKeyId('')
}
