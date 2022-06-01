import {createTempEmptyDir} from '../../src/__tests__/helpers'

import {Git} from '../../src/git'
import {GitRepoDir} from '../../src/git-repo-dir'

describe('Git', () => {
  it('should fail running `git status` when the repo has not been initialized', async () => {
    const gitRepoDir = new GitRepoDir(await createTempEmptyDir())
    const git = new Git(gitRepoDir)

    const checkStatus = (): string | Buffer => {
      return git.status()
    }

    expect(checkStatus).toThrowError()
  })

  it('should not fail running `git status` when the repo has not been initialized', async () => {
    const gitRepoDir = new GitRepoDir(await createTempEmptyDir())
    const git = new Git(gitRepoDir)

    git.init()

    expect(git.status()).toBe(null)
  })

  it('should fail running `git log` when the repo has not been initialized', async () => {
    const gitRepoDir = new GitRepoDir(await createTempEmptyDir())
    const git = new Git(gitRepoDir)

    const checkStatus = (): string | Buffer => {
      return git.log()
    }

    expect(checkStatus).toThrowError()
  })

  it('should fail running `git log` when the repo has been initialized but it does not have a ny commits', async () => {
    const gitRepoDir = new GitRepoDir(await createTempEmptyDir())
    const git = new Git(gitRepoDir)

    git.init()

    const checkStatus = (): string | Buffer => {
      return git.log()
    }

    expect(checkStatus).toThrowError()
  })

  it('should not fail running `git log` when the repo has been initialized and it has at least one commit', async () => {
    const gitRepoDir = new GitRepoDir(await createTempEmptyDir())
    const git = new Git(gitRepoDir)

    git.init()
    git.emptyCommit('not relevant')

    expect(git.log()).toBe(null)
  })
})
