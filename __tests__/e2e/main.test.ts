import * as cp from 'child_process'
import * as path from 'path'
import * as process from 'process'

import {
  createInitializedTempGitDir,
  createInitializedTempGnuPGHomeDir,
  dummyPayload,
  gitLogForLatestCommit
} from '../../src/__tests__/helpers'

import {expect} from '@jest/globals'
import {getErrorMessage} from '../../src/error'
import {testConfiguration} from '../../src/__tests__/config'

function executeAction(env): string | Buffer {
  const np = process.execPath
  const ip = path.join(__dirname, '..', '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env
  }

  let output: string

  try {
    output = cp.execFileSync(np, [ip], options).toString()
  } catch (error) {
    output = getErrorMessage(error)
  }

  return output
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
  it('should print the git repo dir at the beginning of the action execution', async () => {
    const gitRepoDir = await createInitializedTempGitDir()

    const env = {
      ...process.env,
      INPUT_QUEUE_NAME: 'QUEUE-NAME',
      INPUT_GIT_REPO_DIR: gitRepoDir,
      INPUT_ACTION: 'next-job2',
      INPUT_JOB_PAYLOAD: dummyPayload(),
      INPUT_GIT_COMMIT_NO_GPG_SIGN: true
    }

    const output = executeAction(env)

    expect(output).toEqual(
      expect.stringContaining(`git_repo_dir: ${gitRepoDir}`)
    )
  })

  it('should return an error for invalid actions', async () => {
    const gitRepoDir = await createInitializedTempGitDir()

    const env = {
      ...process.env,
      INPUT_QUEUE_NAME: 'QUEUE-NAME',
      INPUT_GIT_REPO_DIR: gitRepoDir,
      INPUT_ACTION: 'INVALID ACTION',
      INPUT_JOB_PAYLOAD: dummyPayload(),
      INPUT_GIT_COMMIT_NO_GPG_SIGN: true
    }

    const output = executeAction(env)

    expect(output).toEqual(
      expect.stringContaining(
        `::error::Invalid action. Actions can only be: create-job, next-job, finish-job`
      )
    )
  })

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

    expect(output).toEqual(
      expect.stringContaining('::set-output name=job_created::true')
    )
    expect(output).toEqual(
      expect.stringContaining('::set-output name=job_commit::')
    )
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

    expect(output).toEqual(
      expect.stringContaining('::set-output name=job_commit::')
    )
    expect(output).toEqual(
      expect.stringContaining(
        `::set-output name=job_payload::${dummyPayload()}`
      )
    )
  })

  it('should mark the pending job as done', async () => {
    const gitRepoDir = await createInitializedTempGitDir()

    createJob(gitRepoDir)

    const env = {
      ...process.env,
      INPUT_QUEUE_NAME: 'QUEUE-NAME',
      INPUT_GIT_REPO_DIR: gitRepoDir,
      INPUT_ACTION: 'finish-job',
      INPUT_GIT_COMMIT_NO_GPG_SIGN: 'true'
    }

    const output = executeAction(env)

    expect(output).toEqual(
      expect.stringContaining('::set-output name=job_created::true')
    )
    expect(output).toEqual(
      expect.stringContaining('::set-output name=job_commit::')
    )
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

    expect(gitLogOutput).toEqual(
      expect.stringContaining('Author: A committer <committer@example.com>')
    )
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

    expect(gitLogOutput).toEqual(
      expect.stringContaining(
        `gpg:                using RSA key ${signingKeyFingerprint}`
      )
    )
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

    expect(gitLogOutput).not.toEqual(expect.stringContaining('gpg: Signature'))
  })
})
