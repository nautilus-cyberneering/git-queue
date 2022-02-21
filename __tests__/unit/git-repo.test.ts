import {
  createTempEmptyDir,
  newSimpleGitWithCommitterIdentity
} from '../../src/__tests__/helpers'

import {GitRepo} from '../../src/git-repo'
import {GitRepoDir} from '../../src/git-repo-dir'

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
