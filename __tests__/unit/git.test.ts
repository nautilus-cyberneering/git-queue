import {createTempEmptyDir} from '../../src/__tests__/helpers'

import {Git} from '../../src/git'
import {GitRepoDir} from '../../src/git-repo-dir'

function gitEnv(): NodeJS.ProcessEnv {
  return {
    LANG: 'en_US.UTF-8'
  }
}

async function newGitInstanceInEmptyWorkingDir(): Promise<Git> {
  const gitRepoDir = new GitRepoDir(await createTempEmptyDir())
  const git = new Git(gitRepoDir, gitEnv())
  return git
}

describe('Git', () => {
  it('should fail running `git status` when the repo has not been initialized', async () => {
    const git = await newGitInstanceInEmptyWorkingDir()

    const checkStatus = (): string | Buffer => {
      return git.status()
    }

    expect(checkStatus).toThrowError()
  })

  it('should not fail running `git status` when the repo has been initialized', async () => {
    const git = await newGitInstanceInEmptyWorkingDir()

    git.init()

    expect(git.status()).toMatch('On branch')
  })

  it('should fail running `git log` when the repo has not been initialized', async () => {
    const git = await newGitInstanceInEmptyWorkingDir()

    const checkStatus = (): string | Buffer => {
      return git.log()
    }

    expect(checkStatus).toThrowError()
  })

  it('should fail running `git log` when the repo has been initialized but it does not have a ny commits', async () => {
    const git = await newGitInstanceInEmptyWorkingDir()

    git.init()

    const checkStatus = (): string | Buffer => {
      return git.log()
    }

    expect(checkStatus).toThrowError()
  })

  it('should not fail running `git log` when the repo has been initialized and it has at least one commit', async () => {
    const git = await newGitInstanceInEmptyWorkingDir()

    git.init()
    git.setLocalConfig('user.name', 'A committer')
    git.setLocalConfig('user.email', 'committer@example.com')
    git.emptyCommit('not relevant')

    expect(git.log()).toBe('')
  })
})
