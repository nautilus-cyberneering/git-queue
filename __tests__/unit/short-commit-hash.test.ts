import {ShortCommitHash, nullShortCommitHash} from '../../src/short-commit-hash'

describe('ShortCommitHash', () => {
  it('should contain the hash of a git commit', () => {
    const commitHash = new ShortCommitHash('ad5cea')

    expect(commitHash.getHash()).toBe('ad5cea')
  })

  it('should compare two commit hashes', () => {
    const commitHash1 = new ShortCommitHash('ad5cea')
    const commitHash2 = new ShortCommitHash('636144')

    expect(commitHash1.equalsTo(commitHash1)).toBe(true)
    expect(commitHash1.equalsTo(commitHash2)).toBe(false)
  })

  it('should be nullable', () => {
    const commitHash = nullShortCommitHash()

    expect(commitHash.isNull()).toBe(true)
  })

  it('could be converted to string', () => {
    const nullObject = nullShortCommitHash()
    expect(nullObject.toString()).toBe('--no-short-commit-hash--')

    const commit = new ShortCommitHash('ad5cea6')
    expect(commit.toString()).toBe('ad5cea6')
  })
})
