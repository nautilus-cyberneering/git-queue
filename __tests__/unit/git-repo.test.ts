import {createTempEmptyDir, newSimpleGit} from '../../src/__tests__/helpers'

import {GitRepo} from '../../src/git-repo'
import {GitRepoDir} from '../../src/git-repo-dir'
import {SimpleGit} from 'simple-git'
import {testConfiguration} from '../../src/__tests__/config'

async function newSimpleGitWithCommitterIdentity(
  gitRepoDir: GitRepoDir
): Promise<SimpleGit> {
  const git = await newSimpleGit(gitRepoDir.getDirPath())
  git.addConfig('user.name', testConfiguration().git.user.name)
  git.addConfig('user.email', testConfiguration().git.user.email)
  return git
}

describe('GitRepo', () => {
  it('should be bound to a file system dir', async () => {
    const gitRepoDir = new GitRepoDir('./')
    const git = await newSimpleGitWithCommitterIdentity(gitRepoDir)

    const gitRepo = new GitRepo(gitRepoDir, git)

    expect(gitRepo.getDir().equalsTo(gitRepoDir)).toBe(true)
  })

  it('could init a git repo', async () => {
    const gitRepoDir = new GitRepoDir(await createTempEmptyDir())
    const git = await newSimpleGitWithCommitterIdentity(gitRepoDir)
    const gitRepo = new GitRepo(gitRepoDir, git)

    await gitRepo.init()

    expect(await gitRepo.isInitialized()).toBe(true)
  })

  it('should check if a repo has been initialized', async () => {
    const gitRepoDir = new GitRepoDir(await createTempEmptyDir())
    const git = await newSimpleGitWithCommitterIdentity(gitRepoDir)
    const gitRepo = new GitRepo(gitRepoDir, git)

    expect(await gitRepo.isInitialized()).toBe(false)

    await gitRepo.init()

    expect(await gitRepo.isInitialized()).toBe(true)
  })
})
