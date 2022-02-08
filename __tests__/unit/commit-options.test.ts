import {CommitAuthor} from '../../src/commit-author'
import {CommitOptions} from '../../src/commit-options'
import {EmailAddress} from '../../src/email-address'
import {SigningKeyId} from '../../src/signing-key-id'

describe('CommitOptions', () => {
  it('should always include --allow-empty option', () => {
    const commitOptions = new CommitOptions(
      new CommitAuthor(new EmailAddress('A Committer <committer@example.com>')),
      new SigningKeyId(''),
      true
    )

    expect(commitOptions.forSimpleGit()).toMatchObject({'--allow-empty': null})
  })

  it('should allow to add a commit author', () => {
    const commitOptions = new CommitOptions(
      new CommitAuthor(new EmailAddress('A Committer <committer@example.com>')),
      new SigningKeyId(''),
      true
    )

    expect(commitOptions.forSimpleGit()).toMatchObject({
      '--author': '"A Committer <committer@example.com>"'
    })
  })

  it('should allow to sign commits', () => {
    const commitOptions = new CommitOptions(
      new CommitAuthor(new EmailAddress('A Committer <committer@example.com>')),
      new SigningKeyId('3F39AA1432CA6AD7'),
      false
    )

    expect(commitOptions.forSimpleGit()).toMatchObject({
      '--gpg-sign': '3F39AA1432CA6AD7'
    })
  })

  it('should allow to disable commits signature', () => {
    const commitOptions = new CommitOptions(
      new CommitAuthor(new EmailAddress('A Committer <committer@example.com>')),
      new SigningKeyId('3F39AA1432CA6AD7'),
      true
    )

    expect(commitOptions.forSimpleGit()).toMatchObject({'--no-gpg-sign': null})
  })

  it('should generate the git commit command arguments', () => {
    const commitOptions = new CommitOptions(
      new CommitAuthor(new EmailAddress('A Committer <committer@example.com>')),
      new SigningKeyId('3F39AA1432CA6AD7'),
      true
    )

    expect(commitOptions.toString()).toBe(
      '--allow-empty --author="A Committer <committer@example.com>" --gpg-sign=3F39AA1432CA6AD7 --no-gpg-sign'
    )
  })
})
