import {isAbsolute, resolve} from 'path'
import {GitDirNotFoundError} from '../../src/errors'
import {GitRepoDir} from '../../src/git-repo-dir'
import {createInexistentTempDir} from '../../src/__tests__/helpers'

describe('GitRepoDir', () => {
  it('should contain dir path for the Git repo', () => {
    const currentDir = resolve('./')
    const gitRepoDir = new GitRepoDir(currentDir)

    expect(gitRepoDir.getDirPath()).toBe(currentDir)
  })

  it('should fail when the dir does not exist', async () => {
    const inexistentDir = await createInexistentTempDir()
    const failingRepoDirTest = (): GitRepoDir => new GitRepoDir(inexistentDir)

    expect(failingRepoDirTest).toThrow(GitDirNotFoundError)
  })

  it('should compare two git repo dirs', () => {
    const gitRepoDir1 = new GitRepoDir('./')
    const gitRepoDir2 = new GitRepoDir('../')

    expect(gitRepoDir1.equalsTo(gitRepoDir1)).toBe(true)
    expect(gitRepoDir1.equalsTo(gitRepoDir2)).toBe(false)
  })

  it('should convert a relative path to an absolute one', () => {
    const gitRepoDir = new GitRepoDir('../')
    expect(isAbsolute(gitRepoDir.getDirPath())).toBe(true)
  })
})
