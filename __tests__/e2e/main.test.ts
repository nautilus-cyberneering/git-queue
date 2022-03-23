import * as cp from 'child_process'
import * as path from 'path'
import * as process from 'process'

import {
  createInitializedGitRepo,
  createInitializedTempGnuPGHomeDir,
  dummyPayload,
  getLatestCommitHash,
  gitLogForLatestCommit
} from '../../src/__tests__/helpers'

import {GitRepo} from '../../src/git-repo'
import {InputsBuilder} from '../../src/__tests__/inputs-builder'

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

function createJob(gitRepo: GitRepo): string | Buffer {
  const env = {
    ...process.env,
    INPUT_QUEUE_NAME: 'queue-name',
    INPUT_GIT_REPO_DIR: gitRepo.getDirPath(),
    INPUT_ACTION: 'create-job',
    INPUT_JOB_PAYLOAD: dummyPayload(),
    INPUT_GIT_COMMIT_NO_GPG_SIGN: true
  }

  return executeAction(env)
}

/**
 * It parses the output to get an output variable value.
 */
function getOutputVariable(
  varName: string,
  output: string
): string | undefined {
  const lines = output.split('\n')

  for (const line of lines) {
    const varPrefix = `::set-output name=${varName}::`
    if (line.startsWith(varPrefix)) {
      const value = line.substring(varPrefix.length)
      return value.trim()
    }
  }

  return undefined
}

describe('GitHub Action', () => {
  it('should print the git repo dir at the beginning of the action execution', async () => {
    const gitRepo = await createInitializedGitRepo()

    const env = {
      ...process.env,
      INPUT_QUEUE_NAME: 'queue-name',
      INPUT_GIT_REPO_DIR: gitRepo.getDirPath(),
      INPUT_ACTION: 'next-job',
      INPUT_JOB_PAYLOAD: dummyPayload(),
      INPUT_GIT_COMMIT_NO_GPG_SIGN: true
    }

    const output = executeAction(env)

    expect(output).toEqual(
      expect.stringContaining(`git_repo_dir: ${gitRepo.getDirPath()}`)
    )
  })

  it('should return an error for invalid actions', async () => {
    const gitRepo = await createInitializedGitRepo()

    const env = {
      ...process.env,
      INPUT_QUEUE_NAME: 'queue-name',
      INPUT_GIT_REPO_DIR: gitRepo.getDirPath(),
      INPUT_ACTION: 'INVALID ACTION',
      INPUT_JOB_PAYLOAD: dummyPayload(),
      INPUT_GIT_COMMIT_NO_GPG_SIGN: true
    }

    const output = executeAction(env)

    expect(output).toEqual(
      expect.stringContaining(
        '::error::Invalid action. Actions can only be: create-job, next-job, start-job, finish-job'
      )
    )
  })

  it('should create a new job', async () => {
    const gitRepo = await createInitializedGitRepo()

    const env = {
      ...process.env,
      INPUT_QUEUE_NAME: 'queue-name',
      INPUT_GIT_REPO_DIR: gitRepo.getDirPath(),
      INPUT_ACTION: 'create-job',
      INPUT_JOB_PAYLOAD: dummyPayload(),
      INPUT_GIT_COMMIT_NO_GPG_SIGN: true
    }

    const output = executeAction(env)

    expect(getOutputVariable('job_created', output.toString())).toBe('true')
    expect(getOutputVariable('job_commit', output.toString())).toBe(
      getLatestCommitHash(gitRepo.getDir()).getHash()
    )
  })

  it('should get the next job', async () => {
    const gitRepo = await createInitializedGitRepo()

    createJob(gitRepo)

    const env = {
      ...process.env,
      INPUT_QUEUE_NAME: 'queue-name',
      INPUT_GIT_REPO_DIR: gitRepo.getDirPath(),
      INPUT_ACTION: 'next-job',
      INPUT_GIT_COMMIT_NO_GPG_SIGN: 'true'
    }

    const output = executeAction(env)

    expect(getOutputVariable('job_payload', output.toString())).toBe(
      dummyPayload()
    )
    expect(getOutputVariable('job_commit', output.toString())).toBe(
      getLatestCommitHash(gitRepo.getDir()).getHash()
    )
  })

  it('should mark the pending job as started', async () => {
    const gitRepo = await createInitializedGitRepo()

    createJob(gitRepo)

    const env = {
      ...process.env,
      INPUT_QUEUE_NAME: 'queue-name',
      INPUT_GIT_REPO_DIR: gitRepo.getDirPath(),
      INPUT_ACTION: 'start-job',
      INPUT_GIT_COMMIT_NO_GPG_SIGN: 'true',
      INPUT_JOB_PAYLOAD: 'test'
    }

    const output = executeAction(env)

    expect(getOutputVariable('job_started', output.toString())).toBe('true')
    expect(getOutputVariable('job_commit', output.toString())).toBe(
      getLatestCommitHash(gitRepo.getDir()).getHash()
    )
  })

  it('should mark the pending job as finished', async () => {
    const gitRepo = await createInitializedGitRepo()

    createJob(gitRepo)

    executeAction({
      ...process.env,
      INPUT_QUEUE_NAME: 'queue-name',
      INPUT_GIT_REPO_DIR: gitRepo.getDirPath(),
      INPUT_ACTION: 'start-job',
      INPUT_GIT_COMMIT_NO_GPG_SIGN: 'true',
      INPUT_JOB_PAYLOAD: 'test'
    })

    const output = executeAction({
      ...process.env,
      INPUT_QUEUE_NAME: 'queue-name',
      INPUT_GIT_REPO_DIR: gitRepo.getDirPath(),
      INPUT_ACTION: 'finish-job',
      INPUT_GIT_COMMIT_NO_GPG_SIGN: 'true',
      INPUT_JOB_PAYLOAD: 'test'
    })

    expect(getOutputVariable('job_finished', output.toString())).toBe('true')
    expect(getOutputVariable('job_commit', output.toString())).toBe(
      getLatestCommitHash(gitRepo.getDir()).getHash()
    )
  })

  it('should allow to overwrite commit signing key', async () => {
    const gitRepo = await createInitializedGitRepo()
    const gnuPGHomeDir = await createInitializedTempGnuPGHomeDir()
    const signingKeyFingerprint =
      testConfiguration().gpg_signing_key.fingerprint

    const env = {
      ...process.env,
      INPUT_QUEUE_NAME: 'queue-name',
      INPUT_GIT_REPO_DIR: gitRepo.getDirPath(),
      INPUT_ACTION: 'create-job',
      INPUT_JOB_PAYLOAD: dummyPayload(),
      INPUT_GIT_COMMIT_GPG_SIGN: signingKeyFingerprint,
      GNUPGHOME: gnuPGHomeDir
    }

    executeAction(env)

    const gitLogOutput = gitLogForLatestCommit(gitRepo.getDirPath())

    expect(gitLogOutput).toEqual(
      expect.stringMatching(`gpg:.+RSA.+${signingKeyFingerprint}`)
    )
  })

  it('should allow to disable commit signing for a given commit', async () => {
    const inputs = await InputsBuilder.instance()
      .withNoGpgSignature()
      .buildInputs()

    const env = {
      ...process.env,
      ...inputs
    }

    executeAction(env)

    const gitLogOutput = gitLogForLatestCommit(inputs.INPUT_GIT_REPO_DIR)

    expect(!gitLogOutput.includes('gpg: Signature')).toBe(true)
    expect(gitLogOutput).not.toEqual(expect.stringContaining('gpg: Signature'))
  })

  it('should always overwrite the commit author with: NautilusCyberneering[bot] <bot@nautilus-cyberneering.de>', async () => {
    const defaultInputs = await InputsBuilder.instance().buildInputs()

    const env = {
      ...process.env,
      ...defaultInputs
    }

    executeAction(env)

    const gitLogOutput = gitLogForLatestCommit(defaultInputs.INPUT_GIT_REPO_DIR)

    expect(gitLogOutput).toEqual(
      expect.stringContaining(
        'Author: NautilusCyberneering[bot] <bot@nautilus-cyberneering.de>'
      )
    )
  })
})
