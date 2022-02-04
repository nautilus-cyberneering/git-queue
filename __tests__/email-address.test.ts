import {EmailAddress} from '../src/email-address'

describe('EmailAddress', () => {
  it('should accept email addresses with display name', () => {
    const emailAddress = new EmailAddress('A Committer <committer@example.com>')

    expect(emailAddress.getDisplayName()).toBe('A Committer')
    expect(emailAddress.getEmail()).toBe('committer@example.com')
  })

  it('should print the email address with display name', () => {
    const emailAddress = new EmailAddress('A Committer <committer@example.com>')

    expect(emailAddress.toString()).toBe('A Committer <committer@example.com>')
  })

  it('should fail when you try to build a bad formatted email address', () => {
    const a1 = () => {
      new EmailAddress('abc_NO_AT_example.com')
    }
    expect(a1).toThrow(Error)

    const a2 = () => {
      new EmailAddress('A Committer <abc_NO_AT_example.com>')
    }
    expect(a2).toThrow(Error)
  })
})
