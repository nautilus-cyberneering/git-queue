import {EmailAddress} from './email-address'
import {Nullable} from './nullable'

const NO_AUTHOR_NAME = '--no-author--'
const NO_AUTHOR_EMAIL = 'no-author@no-author.com'

export class CommitAuthor implements Nullable {
  private emailAddress: EmailAddress

  constructor(emailAddress: EmailAddress) {
    this.emailAddress = emailAddress
  }

  static fromEmailAddressString(emailAddress: string): CommitAuthor {
    return new CommitAuthor(new EmailAddress(emailAddress))
  }

  static fromNameAndEmail(name: string, email: string): CommitAuthor {
    return new CommitAuthor(EmailAddress.fromDisplayNameAndEmail(name, email))
  }

  getName(): string {
    return this.emailAddress.getDisplayName()
  }

  getEmail(): string {
    return this.emailAddress.getEmail()
  }

  toString(): string {
    return this.emailAddress.toString()
  }

  isNull(): boolean {
    return (
      this.getName() === NO_AUTHOR_NAME && this.getEmail() === NO_AUTHOR_EMAIL
    )
  }
}

export function emptyCommitAuthor(): CommitAuthor {
  return CommitAuthor.fromNameAndEmail(NO_AUTHOR_NAME, NO_AUTHOR_EMAIL)
}
