import {
  createInitializedGitRepo,
  createInitializedTempGnuPGHomeDir,
  createNotInitializedGitRepo,
  dummyPayload,
  getLatestCommitHash,
  gitLogForLatestCommit
} from '../../src/__tests__/helpers'

import {CommitAuthor} from '../../src/commit-author'
import {CommitHash} from '../../src/commit-hash'
import {CommitInfo} from '../../src/commit-info'
import {CommitOptions} from '../../src/commit-options'
import {NewJobCommittedMessage} from '../../src/committed-message'
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
  it('could be empty', async () => {
    const queue = await createTestQueue(commitOptionsForTests())

    expect(queue.isEmpty()).toBe(true)
  })

  it('should dispatch a new job', async () => {
    const queue = await createTestQueue(commitOptionsForTests())

    const commit = await queue.createJob(dummyPayload())

    // The job was created with the right payload
    const nextJob = queue.getNextJob()
    expect(nextJob.isNull()).toBe(false)
    expect(nextJob.payload()).toBe(dummyPayload())

    // The commit was created with the right hash
    const newJobCommit = new CommitHash(
      getLatestCommitHash(queue.getGitRepoDir().getDirPath())
    )
    expect(newJobCommit.equalsTo(commit.hash)).toBe(true)

    // TODO: Code Review. Should we check not only the commit hash but the CommittedMessage?
    // Maybe we should return the CommittedMessage.
    // const committedMessage = await queue.createJob(dummyPayload())
    // expect(committedMessage).toBeInstance(JobStartedCommittedMessage)
  })

  it('should fail when trying to create a job if the previous job has not finished yet', async () => {
    const queue = await createTestQueue(commitOptionsForTests())

    const commit = await queue.createJob(dummyPayload())

    const fn = async (): Promise<CommitInfo> => {
      return queue.createJob(dummyPayload())
    }

    const expectedError = `Can't create job. Previous message is not a job finished message. Previous message commit: ${commit.hash}`

    await expect(fn()).rejects.toThrowError(expectedError)
  })

  it('should mark a job as finished', async () => {
    const queue = await createTestQueue(commitOptionsForTests())

    await queue.createJob(dummyPayload())
    await queue.markJobAsStarted(dummyPayload())
    const commit = await queue.markJobAsFinished(dummyPayload())

    const nextJob = queue.getNextJob()
    expect(nextJob.isNull()).toBe(true)

    const finishJobCommit = new CommitHash(
      getLatestCommitHash(queue.getGitRepoDir().getDirPath())
    )
    expect(finishJobCommit.equalsTo(commit.hash)).toBe(true)
  })

  it('should fail when trying to finish a job without any pending to finish job', async () => {
    const queue = await createTestQueue(commitOptionsForTests())

    const fn = async (): Promise<CommitInfo> => {
      return queue.markJobAsFinished(dummyPayload())
    }

    const expectedError = `Can't finish job. Previous message is not a job started message. Previous message commit: --no-commit-hash--`

    await expect(fn()).rejects.toThrowError(expectedError)
  })

  it('should mark a job as started', async () => {
    const queue = await createTestQueue(commitOptionsForTests())

    await queue.createJob(dummyPayload())
    await queue.markJobAsStarted(dummyPayload())

    const nextJob = queue.getNextJob()

    expect(nextJob.isNull()).toBe(false)
    expect(nextJob instanceof NewJobCommittedMessage).toBe(true)
  })

  it('should allow to specify the commit author', async () => {
    const queue = await createTestQueue(commitOptionsForTests())

    await queue.createJob(dummyPayload())

    const output = gitLogForLatestCommit(queue.getGitRepoDir().getDirPath())

    expect(output.includes('Author: A committer <committer@example.com>')).toBe(
      true
    )
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

  it('should return all the messages in the queue', async () => {
    const queue = await createTestQueue(commitOptionsForTests())

    await queue.createJob(dummyPayload())

    const messages = queue.getMessages()

    expect(messages).toContain(queue.getLatestMessage())
  })

  describe('should return the next job to do, returning ...', () => {
    it('null message when there are no pending jobs', async () => {
      const queue = await createTestQueue(commitOptionsForTests())

      const nextJob = queue.getNextJob()

      expect(nextJob.isNull()).toBe(true)
    })

    it('a new job message when there is only one pending job', async () => {
      const queue = await createTestQueue(commitOptionsForTests())

      await queue.createJob(dummyPayload())

      const nextJob = queue.getNextJob()

      expect(nextJob.isNull()).toBe(false)
      expect(nextJob.payload()).toBe(dummyPayload())
    })

    it('a new job message also when there is also a previous finished job', async () => {
      const queue = await createTestQueue(commitOptionsForTests())

      // First job
      await queue.createJob(dummyPayload())
      await queue.markJobAsStarted(dummyPayload())
      await queue.markJobAsFinished(dummyPayload())

      // Second job
      const commit = await queue.createJob(dummyPayload())

      const nextJob = queue.getNextJob()

      expect(nextJob.isNull()).toBe(false)
      expect(nextJob.payload()).toBe(dummyPayload())
      const newJobCommit = new CommitHash(
        getLatestCommitHash(queue.getGitRepoDir().getDirPath())
      )
      expect(newJobCommit.equalsTo(commit.hash)).toBe(true)
    })
  })
})
