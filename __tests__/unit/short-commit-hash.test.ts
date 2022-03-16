import {ShortCommitHash, nullShortCommitHash} from '../../src/short-commit-hash'

describe('ShortCommitHash', () => {
  it('should contain the hash of a git commit', () => {
    const commitHash = new ShortCommitHash('ad5acea')

    expect(commitHash.getHash()).toBe('ad5acea')
  })

  it('should fail when using invalid hash value', () => {
    const longHash = (): ShortCommitHash => {
      return new ShortCommitHash('ad5cea6308f69d7955d8de5f0da19f675d5ba75f')
    }
    const shortHash = (): ShortCommitHash => {
      return new ShortCommitHash('aa')
    }
    const nonSHA1Hash = (): ShortCommitHash => {
      return new ShortCommitHash('ada-ea6')
    }

    expect(longHash).toThrowError()
    expect(shortHash).toThrowError()
    expect(nonSHA1Hash).toThrowError()
  })

  it('should compare two commit hashes', () => {
    const commitHash1 = new ShortCommitHash('ad5acea')
    const commitHash2 = new ShortCommitHash('636a144')

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
