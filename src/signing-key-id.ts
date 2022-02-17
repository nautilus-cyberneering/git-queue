import {Nullable} from './nullable'

const NO_SIGNING_KEY_ID = '--no-signing-key-id--'

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
    return this.id === NO_SIGNING_KEY_ID
  }
}

export function nullSigningKeyId(): SigningKeyId {
  return new SigningKeyId(NO_SIGNING_KEY_ID)
}
