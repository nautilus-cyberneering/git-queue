import {
  createTempEmptyDir,
  newSimpleGitWithCommitterIdentity
} from '../../src/__tests__/helpers'

import {GitRepo} from '../../src/git-repo'
import {GitRepoDir} from '../../src/git-repo-dir'
import {join} from 'path'
import {mkdirSync} from 'fs'

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

    expect(gitRepo.isInitialized()).toBe(true)
  })

  it('should check if a repo has been initialized', async () => {
    const gitRepoDir = new GitRepoDir(await createTempEmptyDir())
    const git = await newSimpleGitWithCommitterIdentity(gitRepoDir)
    const gitRepo = new GitRepo(gitRepoDir, git)

    expect(gitRepo.isInitialized()).toBe(false)

    await gitRepo.init()

    expect(gitRepo.isInitialized()).toBe(true)
  })

  it('should check if a repo has been initialized using a relative path', async () => {
    const tempEmptyDir = await createTempEmptyDir()
    mkdirSync(join(tempEmptyDir, 'a'))
    mkdirSync(join(tempEmptyDir, 'b'))
    const currentDir = process.cwd()
    process.chdir(join(tempEmptyDir, 'a'))

    const gitRepoDir = new GitRepoDir('../b')

    const git = await newSimpleGitWithCommitterIdentity(gitRepoDir)
    const gitRepo = new GitRepo(gitRepoDir, git)
    await gitRepo.init()
    expect(gitRepo.isInitialized()).toBe(true)

    process.chdir(currentDir)
  })
})
