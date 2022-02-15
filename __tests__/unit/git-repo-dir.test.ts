import {GitRepoDir} from '../../src/git-repo-dir'

describe('GitRepoDir', () => {
  it('should contain dir path for the Git repo', () => {
    const gitRepoDir = new GitRepoDir('./')

    expect(gitRepoDir.getDirPath()).toBe('./')
  })
})
