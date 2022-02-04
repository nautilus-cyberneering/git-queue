import {CommitAuthor} from '../src/commit-author'
import {CommitOptions} from '../src/commit-options'
import {Queue} from '../src/queue'
import {SigningKeyId} from '../src/signing-key-id'
import {
  createTempEmptyDir,
  createInitializedTempGnuPGHomeDir,
  dummyPayload,
  gitLogForLatestCommit,
  newSimpleGit
} from '../src/__tests__/helpers'
import {testConfiguration} from '../src/__tests__/config'

function commitOptionsForTests() {
  const author = CommitAuthor.fromNameAndEmail(
    'A committer',
    'committer@example.com'
  )
  const signingKeyId = new SigningKeyId('')
  const noGpgSig = true
  return new CommitOptions(author, signingKeyId, noGpgSig)
}

function commitOptionsForTestsUsingSignature() {
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

describe('Queue', () => {
  it('should dispatch a new job', async () => {
    const gitRepoDir = await createTempEmptyDir()
    const git = await newSimpleGit(gitRepoDir, true)

    let queue = await Queue.create('QUEUE NAME', gitRepoDir, git)

    await queue.createJob(dummyPayload(), commitOptionsForTests())

    const nextJob = queue.getNextJob()

    expect(nextJob.payload()).toBe(dummyPayload())
  })

  it('should mark a job as done', async () => {
    const gitRepoDir = await createTempEmptyDir()
    const git = await newSimpleGit(gitRepoDir, true)

    let queue = await Queue.create('QUEUE NAME', gitRepoDir, git)

    await queue.createJob(dummyPayload(), commitOptionsForTests())
    await queue.markJobAsDone(dummyPayload(), commitOptionsForTests())

    const nextJob = queue.getNextJob()

    expect(nextJob.isEmpty()).toBe(true)
  })

  it('should allow to specify the commit author', async () => {
    const gitRepoDir = await createTempEmptyDir()
    const git = await newSimpleGit(gitRepoDir, true)

    let queue = await Queue.create('QUEUE NAME', gitRepoDir, git)

    await queue.createJob(dummyPayload(), commitOptionsForTests())

    const output = gitLogForLatestCommit(gitRepoDir)

    expect(output.includes('Author: A committer <committer@example.com>')).toBe(
      true
    )
  })

  it('should allow to sign commits', async () => {
    const gitRepoDir = await createTempEmptyDir()
    const gnuPGHomeDir = await createInitializedTempGnuPGHomeDir()
    const signingKeyFingerprint =
      testConfiguration().gpg_signing_key.fingerprint

    const git = await newSimpleGit(gitRepoDir, true)

    git.addConfig('user.name', testConfiguration().git.user.name)
    git.addConfig('user.email', testConfiguration().git.user.email)
    git.env('GNUPGHOME', gnuPGHomeDir)

    let queue = await Queue.create('QUEUE NAME', gitRepoDir, git)

    await queue.createJob(dummyPayload(), commitOptionsForTestsUsingSignature())

    const output = gitLogForLatestCommit(gitRepoDir)

    expect(
      output.includes(
        `gpg:                using RSA key ${signingKeyFingerprint}`
      )
    ).toBe(true)
  })
})
