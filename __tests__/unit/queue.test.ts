import {
  createInitializedGitRepo,
  createInitializedTempGnuPGHomeDir,
  createNotInitializedGitRepo,
  dummyPayload,
  gitLogForLatestCommit
} from '../../src/__tests__/helpers'

import {CommitAuthor} from '../../src/commit-author'
import {CommitOptions} from '../../src/commit-options'
import {Queue} from '../../src/queue'
import {QueueName} from '../../src/queue-name'
import {SigningKeyId} from '../../src/signing-key-id'

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

async function createTestQueue(commitOptions: CommitOptions): Promise<Queue> {
  const gitRepo = await createInitializedGitRepo()

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
    const gitRepo = await createInitializedGitRepo()

    const gnuPGHomeDir = await createInitializedTempGnuPGHomeDir()
    const signingKeyFingerprint =
      testConfiguration().gpg_signing_key.fingerprint
    gitRepo.env('GNUPGHOME', gnuPGHomeDir)

    const queue = await Queue.create(
      new QueueName('QUEUE NAME'),
      gitRepo,
      commitOptionsForTestsUsingSignature()
    )

    await queue.createJob(dummyPayload())

    const output = gitLogForLatestCommit(gitRepo.getDirPath())

    expect(
      output.includes(
        `gpg:                using RSA key ${signingKeyFingerprint}`
      )
    ).toBe(true)
  })

  it('should fail when it is created from an uninitialized git repo', async () => {
    const gitRepo = await createNotInitializedGitRepo()

    const fn = async (): Promise<Queue> => {
      const queue = await Queue.create(
        new QueueName('QUEUE NAME'),
        gitRepo,
        commitOptionsForTests()
      )
      return queue
    }

    const expectedError = `Git dir: ${gitRepo.getDirPath()} has not been initialized`

    await expect(fn()).rejects.toThrowError(expectedError)
  })
})
