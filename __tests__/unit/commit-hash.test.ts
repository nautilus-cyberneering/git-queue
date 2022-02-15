import {CommitHash, nullCommitHash} from '../../src/commit-hash'

describe('CommitHash', () => {
  it('should contain the hash of a git commit', () => {
    const commitHash = new CommitHash(
      'ad5cea6308f69d7955d8de5f0da19f675d5ba75f'
    )

    expect(commitHash.getHash()).toBe(
      'ad5cea6308f69d7955d8de5f0da19f675d5ba75f'
    )
  })

  it('should compare two commit hashes', () => {
    const commitHash1 = new CommitHash(
      'ad5cea6308f69d7955d8de5f0da19f675d5ba75f'
    )

    const commitHash2 = new CommitHash(
      '636144d261b355316754397a7956813a6b0e80ad'
    )

    expect(commitHash1.equalsTo(commitHash1)).toBe(true)
    expect(commitHash1.equalsTo(commitHash2)).toBe(false)
  })

  it('should be nullable', () => {
    const commitHash = nullCommitHash()

    expect(commitHash.isNull()).toBe(true)
  })

  it('could be converted to string', () => {
    const nullObject = nullCommitHash()
    expect(nullObject.toString()).toBe('')

    const commit = new CommitHash('ad5cea6308f69d7955d8de5f0da19f675d5ba75f')
    expect(commit.toString()).toBe('ad5cea6308f69d7955d8de5f0da19f675d5ba75f')
  })
})
