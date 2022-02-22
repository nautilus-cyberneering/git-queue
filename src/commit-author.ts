import {EmailAddress} from './email-address'

export class CommitAuthor {
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
}

export function getCommitAuthor(): CommitAuthor {
  return CommitAuthor.fromEmailAddressString(
    'NautilusCyberneering[bot] <bot@nautilus-cyberneering.de>'
  )
}
