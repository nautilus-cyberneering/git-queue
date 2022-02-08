import {CommitAuthor} from '../../src/commit-author'
import {EmailAddress} from '../../src/email-address'

describe('CommitAuthor', () => {
  it('should have a name and email', () => {
    const commitAuthor = new CommitAuthor(
      new EmailAddress('A committer <committer@example.com>')
    )

    expect(commitAuthor.getName()).toBe('A committer')
    expect(commitAuthor.getEmail()).toBe('committer@example.com')
  })

  it('should cast to string using the git commit --author option format', () => {
    const commitAuthor = new CommitAuthor(
      new EmailAddress('A committer <committer@example.com>')
    )

    expect(commitAuthor.toString()).toBe('A committer <committer@example.com>')
  })

  it('should instantiate from standard email address format: A committer <committer@example.com>', () => {
    const commitAuthor = CommitAuthor.fromEmailAddressString(
      'A committer <committer@example.com>'
    )

    expect(commitAuthor.toString()).toBe('A committer <committer@example.com>')
  })
})
