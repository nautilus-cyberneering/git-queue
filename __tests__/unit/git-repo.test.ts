import {
  commitOptionsForTests,
  createTempEmptyDir,
  dummyCommitBodyText,
  dummyCommitSubjectText,
  newSimpleGitWithCommitterIdentity
} from '../../src/__tests__/helpers'

import {CommitBody} from '../../src/commit-body'
import {CommitMessage} from '../../src/commit-message'
import {CommitSubjectParser} from '../../src/commit-subject-parser'
import {GitDirNotInitializedError} from '../../src/errors'
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

  it('should check if a repo has commits', async () => {
    const gitRepoDir = new GitRepoDir(await createTempEmptyDir())
    const git = await newSimpleGitWithCommitterIdentity(gitRepoDir)
    const gitRepo = new GitRepo(gitRepoDir, git)

    await gitRepo.init()

    const subject = CommitSubjectParser.parseText(dummyCommitSubjectText())
    const body = new CommitBody(dummyCommitBodyText())

    const commitMessage = new CommitMessage(subject, body)

    await expect(gitRepo.hasCommits()).resolves.toBe(false)

    await gitRepo.commit(commitMessage, commitOptionsForTests())

    await expect(gitRepo.hasCommits()).resolves.toBe(true)
  })

  it('should fail when the repo has not been initialized and check if it has commits', async () => {
    const gitRepoDir = new GitRepoDir(await createTempEmptyDir())
    const git = await newSimpleGitWithCommitterIdentity(gitRepoDir)
    const gitRepo = new GitRepo(gitRepoDir, git)

    await expect(gitRepo.hasCommits()).rejects.toThrow(
      GitDirNotInitializedError
    )
  })
})
