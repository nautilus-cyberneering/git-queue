import {
  createInitializedTempGitDir,
  createInitializedTempGnuPGHomeDir,
  dummyPayload,
  gitLogForLatestCommit,
  newSimpleGit
} from '../../src/__tests__/helpers'

import {CommitAuthor} from '../../src/commit-author'
import {CommitOptions} from '../../src/commit-options'
import {GitRepo} from '../../src/git-repo'
import {GitRepoDir} from '../../src/git-repo-dir'
import {Queue} from '../../src/queue'
import {QueueName} from '../../src/queue-name'
import {SigningKeyId} from '../../src/signing-key-id'
import {SimpleGit} from 'simple-git'

import {testConfiguration} from '../../src/__tests__/config'

function commitOptionsForTests(): CommitOptions {
  const author = CommitAuthor.fromNameAndEmail(
    'A committer',
    'committer@example.com'
  )
  const signingKeyId = new SigningKeyId('')
  const noGpgSig = true
  return new CommitOptions(author, signingKeyId, noGpgSig)
}

function commitOptionsForTestsUsingSignature(): CommitOptions {
  const author = CommitAuthor.fromNameAndEmail(
    'A committer',
    'committer@example.com'
  )
  const signingKeyId = new SigningKeyId(
    testConfiguration().gpg_signing_key.fingerprint
  )
  const noGpgSig = false
  return new CommitOptions(author, signingKeyId, noGpgSig)
}

async function newSimpleGitWithCommitterIdentity(
  gitRepoDir: string
): Promise<SimpleGit> {
  const git = await newSimpleGit(gitRepoDir)
  git.addConfig('user.name', testConfiguration().git.user.name)
  git.addConfig('user.email', testConfiguration().git.user.email)
  return git
}

async function createTestQueue(commitOptions: CommitOptions): Promise<Queue> {
  const gitRepoDir = await createInitializedTempGitDir()

  const git = await newSimpleGitWithCommitterIdentity(gitRepoDir)

  const gitRepo = new GitRepo(new GitRepoDir(gitRepoDir), git)

  const queue = await Queue.create(
    new QueueName('QUEUE NAME'),
    gitRepo,
    commitOptions
  )

  return queue
}

describe('Queue', () => {
  it('should dispatch a new job', async () => {
    const queue = await createTestQueue(commitOptionsForTests())

    await queue.createJob(dummyPayload())

    const nextJob = queue.getNextJob()

    expect(nextJob.payload()).toBe(dummyPayload())
  })

  it('should mark a job as finished', async () => {
    const queue = await createTestQueue(commitOptionsForTests())

    await queue.createJob(dummyPayload())
    await queue.markJobAsFinished(dummyPayload())

    const nextJob = queue.getNextJob()

    expect(nextJob.isNull()).toBe(true)
  })

  it('should allow to specify the commit author', async () => {
    const queue = await createTestQueue(commitOptionsForTests())

    await queue.createJob(dummyPayload())

    const output = gitLogForLatestCommit(queue.getGitRepoDir().getDirPath())

    expect(output.includes('Author: A committer <committer@example.com>')).toBe(
      true
    )
  })

  it('should find an stored message by its commit hash', async () => {
    const queue = await createTestQueue(commitOptionsForTests())

    const commit = await queue.createJob(dummyPayload())

    const committedMessage = queue.findCommittedMessageByCommit(commit.hash)

    expect(committedMessage.commitHash().equalsTo(commit.hash)).toBe(true)
  })

  it('should allow to sign commits', async () => {
    const gitRepoDir = await createInitializedTempGitDir()

    const gnuPGHomeDir = await createInitializedTempGnuPGHomeDir()
    const signingKeyFingerprint =
      testConfiguration().gpg_signing_key.fingerprint

    const git = await newSimpleGitWithCommitterIdentity(gitRepoDir)

    git.env('GNUPGHOME', gnuPGHomeDir)

    const gitRepo = new GitRepo(new GitRepoDir(gitRepoDir), git)

    const queue = await Queue.create(
      new QueueName('QUEUE NAME'),
      gitRepo,
      commitOptionsForTestsUsingSignature()
    )

    await queue.createJob(dummyPayload())

    const output = gitLogForLatestCommit(gitRepoDir)

    expect(
      output.includes(
        `gpg:                using RSA key ${signingKeyFingerprint}`
      )
    ).toBe(true)
  })
})
