import {GitDirNotExistsError} from '../../src/errors'
import {GitRepoDir} from '../../src/git-repo-dir'
import {createInexistentTempDir} from '../../src/__tests__/helpers'

describe('GitRepoDir', () => {
  it('should contain dir path for the Git repo', () => {
    const gitRepoDir = new GitRepoDir('./')

    expect(gitRepoDir.getDirPath()).toBe('./')
  })

  it('should throw on a non-existent Dir initialization', async () => {
    const inexistentDir = await createInexistentTempDir()
    const failingRepoDirTest = (): GitRepoDir => new GitRepoDir(inexistentDir)

    expect(failingRepoDirTest).toThrow(GitDirNotExistsError)
  })

  it('should compare two git repo dirs', () => {
    const gitRepoDir1 = new GitRepoDir('./')
    const gitRepoDir2 = new GitRepoDir('../')

    expect(gitRepoDir1.equalsTo(gitRepoDir1)).toBe(true)
    expect(gitRepoDir1.equalsTo(gitRepoDir2)).toBe(false)
  })
})
