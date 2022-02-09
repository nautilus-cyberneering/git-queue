import {EmailAddress, emailIsValid} from '../../src/email-address'

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
    const a1 = (): EmailAddress => new EmailAddress('abc_NO_AT_example.com')
    expect(a1).toThrow(Error)

    const a2 = (): EmailAddress =>
      new EmailAddress('A Committer <abc_NO_AT_example.com>')
    expect(a2).toThrow(Error)
  })

  it('should validate email addresses', () => {
    const validEmails = [
      'Abc@example.com',
      'Abc@example.com.',
      'Abc@10.42.0.1',
      'user@localserver',
      'Abc.123@example.com',
      'user+mailbox/department=shipping@example.com',
      '"very.(),:;<>[]".VERY."very@\\ "very".unusual"@strange.example.com',
      "!#$%&'*+-/=?^_`.{|}~@example.com",
      '"()<>[]:,;@\\"!#$%&\'-/=?^_`{}| ~.a"@example.org',
      '"Abc@def"@example.com',
      '"Fred Bloggs"@example.com',
      '"Joe.\\Blow"@example.com',
      'Loïc.Accentué@voilà.fr',
      'user@[IPv6:2001:DB8::1]',
      '" "@example.org'
    ]

    for (const email of validEmails) {
      expect(emailIsValid(email)).toBe(true)
    }

    const invalidEmails = [
      'A@b@c@example.com',
      'a"b(c)d,e:f;g<h>i[jk]l@example.com',
      'just"not"right@example.com',
      'this is"notallowed@example.com',
      'this still"not\\allowed@example.com',
      'john..doe@example.com',
      'john.doe@example..com'
    ]

    for (const email of invalidEmails) {
      expect(emailIsValid(email)).toBe(false)
    }
  })
})
