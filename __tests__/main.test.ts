import * as cp from 'child_process'
import * as path from 'path'
import * as process from 'process'

import {
  createInitializedTempGitDir,
  createInitializedTempGnuPGHomeDir,
  dummyPayload,
  gitLogForLatestCommit
} from '../src/__tests__/helpers'

import {expect} from '@jest/globals'
import {testConfiguration} from '../src/__tests__/config'

function executeAction(env): string | Buffer {
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env
  }
  return cp.execFileSync(np, [ip], options).toString()
}

function createJob(gitRepoDir): string | Buffer {
  const env = {
    ...process.env,
    INPUT_QUEUE_NAME: 'QUEUE-NAME',
    INPUT_GIT_REPO_DIR: gitRepoDir,
    INPUT_ACTION: 'create-job',
    INPUT_JOB_PAYLOAD: dummyPayload(),
    INPUT_GIT_COMMIT_NO_GPG_SIGN: true
  }

  return executeAction(env)
}

describe('GitHub Action', () => {
  it('should create a new job', async () => {
    const gitRepoDir = await createInitializedTempGitDir()

    const env = {
      ...process.env,
      INPUT_QUEUE_NAME: 'QUEUE-NAME',
      INPUT_GIT_REPO_DIR: gitRepoDir,
      INPUT_ACTION: 'create-job',
      INPUT_JOB_PAYLOAD: dummyPayload(),
      INPUT_GIT_COMMIT_NO_GPG_SIGN: true
    }

    const output = executeAction(env)

    expect(output.includes('::set-output name=job_created::true')).toBe(true)
    expect(output.includes('::set-output name=job_commit::')).toBe(true)
  })

  it('should get the next job', async () => {
    const gitRepoDir = await createInitializedTempGitDir()

    createJob(gitRepoDir)

    const env = {
      ...process.env,
      INPUT_QUEUE_NAME: 'QUEUE-NAME',
      INPUT_GIT_REPO_DIR: gitRepoDir,
      INPUT_ACTION: 'next-job',
      INPUT_GIT_COMMIT_NO_GPG_SIGN: 'true'
    }

    const output = executeAction(env)

    expect(output.includes('::set-output name=job_commit::')).toBe(true)
    expect(
      output.includes(`::set-output name=job_payload::${dummyPayload()}`)
    ).toBe(true)
  })

  it('should mark the pending job as done', async () => {
    const gitRepoDir = await createInitializedTempGitDir()

    createJob(gitRepoDir)

    const env = {
      ...process.env,
      INPUT_QUEUE_NAME: 'QUEUE-NAME',
      INPUT_GIT_REPO_DIR: gitRepoDir,
      INPUT_ACTION: 'mark-job-as-done',
      INPUT_GIT_COMMIT_NO_GPG_SIGN: 'true'
    }

    const output = executeAction(env)

    expect(output.includes('::set-output name=job_created::true')).toBe(true)
    expect(output.includes('::set-output name=job_commit::')).toBe(true)
  })

  it('should allow to overwrite commit author', async () => {
    const gitRepoDir = await createInitializedTempGitDir()

    const env = {
      ...process.env,
      INPUT_QUEUE_NAME: 'QUEUE-NAME',
      INPUT_GIT_REPO_DIR: gitRepoDir,
      INPUT_ACTION: 'create-job',
      INPUT_JOB_PAYLOAD: dummyPayload(),
      INPUT_GIT_COMMIT_NO_GPG_SIGN: 'true',
      INPUT_GIT_COMMIT_AUTHOR: 'A committer <committer@example.com>'
    }

    executeAction(env)

    const gitLogOutput = gitLogForLatestCommit(gitRepoDir)

    expect(
      gitLogOutput.includes('Author: A committer <committer@example.com>')
    ).toBe(true)
  })

  it('should allow to overwrite commit signing key', async () => {
    const gitRepoDir = await createInitializedTempGitDir()
    const gnuPGHomeDir = await createInitializedTempGnuPGHomeDir()
    const signingKeyFingerprint =
      testConfiguration().gpg_signing_key.fingerprint

    const env = {
      ...process.env,
      INPUT_QUEUE_NAME: 'QUEUE-NAME',
      INPUT_GIT_REPO_DIR: gitRepoDir,
      INPUT_ACTION: 'create-job',
      INPUT_JOB_PAYLOAD: dummyPayload(),
      INPUT_GIT_COMMIT_GPG_SIGN: signingKeyFingerprint,
      GNUPGHOME: gnuPGHomeDir
    }

    executeAction(env)

    const gitLogOutput = gitLogForLatestCommit(gitRepoDir)

    expect(
      gitLogOutput.includes(
        `gpg:                using RSA key ${signingKeyFingerprint}`
      )
    ).toBe(true)
  })

  it('should allow to disable commit signing for a given commit', async () => {
    const gitRepoDir = await createInitializedTempGitDir()

    const env = {
      ...process.env,
      INPUT_QUEUE_NAME: 'QUEUE-NAME',
      INPUT_GIT_REPO_DIR: gitRepoDir,
      INPUT_ACTION: 'create-job',
      INPUT_JOB_PAYLOAD: dummyPayload(),
      INPUT_GIT_COMMIT_NO_GPG_SIGN: 'true'
    }

    executeAction(env)

    const gitLogOutput = gitLogForLatestCommit(gitRepoDir)

    expect(!gitLogOutput.includes('gpg: Signature')).toBe(true)
  })
})
