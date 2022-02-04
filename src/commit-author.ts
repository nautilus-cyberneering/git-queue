import {EmailAddress} from './email-address'

const NO_AUTHOR_NAME = '--no-author--'
const NO_AUTHOR_EMAIL = 'no-author@no-author.com'

export class CommitAuthor {
  private emailAddress: EmailAddress

  constructor(emailAddress: EmailAddress) {
    this.emailAddress = emailAddress
  }

  public static fromEmailAddressString(emailAddress: string) {
    return new CommitAuthor(new EmailAddress(emailAddress))
  }

  public static fromNameAndEmail(name: string, email: string) {
    return new CommitAuthor(EmailAddress.fromDisplayNameAndEmail(name, email))
  }

  public getName(): string {
    return this.emailAddress.getDisplayName()
  }

  public getEmail(): string {
    return this.emailAddress.getEmail()
  }

  public toString(): string {
    return this.emailAddress.toString()
  }

  isEmpty() {
    return (
      this.getName() == NO_AUTHOR_NAME && this.getEmail() == NO_AUTHOR_EMAIL
    )
  }
}

export function emptyCommitAuthor() {
  return CommitAuthor.fromNameAndEmail(NO_AUTHOR_NAME, NO_AUTHOR_EMAIL)
}
