/*
 * Wrapper for RFC5322 email address.
 *
 * For example:
 *
 * A Committer <committer@example.com>
 * John Smith <john.smith@example.org>
 * committer@example.com
 *
 * For this app we only allow this formats:
 *
 * [NAME] <EMAIL>
 * EMAIL
 *
 * NAME is optional.
 */
export class EmailAddress {
  private displayName: string
  private email: string

  constructor(emailAddress: string) {
    this.displayName = this.extractDisplayName(emailAddress)
    this.email = this.extractEmail(emailAddress)

    if (!this.isValid(this.email)) {
      throw Error(`Invalid email: ${this.email}`)
    }
  }

  static fromDisplayNameAndEmail(
    displayName: string,
    email: string
  ): EmailAddress {
    return new EmailAddress(`${displayName} <${email}>`)
  }

  getDisplayName(): string {
    return this.displayName
  }

  getEmail(): string {
    return this.email
  }

  toString(): string {
    if (this.displayName === '') {
      return this.email
    }

    return `${this.displayName} <${this.email}>`
  }

  private extractDisplayName(emailAddress: string): string {
    if (!this.containsDisplayName(emailAddress)) {
      return ''
    }

    const beginEmail = emailAddress.indexOf('<')
    const name = emailAddress.substring(0, beginEmail - 1)

    return name
  }

  private extractEmail(emailAddress: string): string {
    if (!this.containsDisplayName(emailAddress)) {
      return emailAddress
    }

    const firstChar = emailAddress.indexOf('<')
    const lastChar = emailAddress.indexOf('>')
    const email = emailAddress.substring(firstChar + 1, lastChar)

    return email
  }

  private isValid(email: string): boolean {
    return /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(
      email
    )
  }

  private containsDisplayName(emailAddress: string): boolean {
    const firstChar = emailAddress.indexOf('<')
    const lastChar = emailAddress.indexOf('>')
    return firstChar !== -1 && lastChar !== -1
  }
}
