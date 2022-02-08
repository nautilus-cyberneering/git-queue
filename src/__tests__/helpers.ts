import * as cp from 'child_process'
import * as gpg from './gpg'
import * as openpgp from './openpgp'

import {SimpleGit} from 'simple-git/typings/simple-git.d'
import {createTempDir} from 'jest-fixtures'
import simpleGit from 'simple-git'
import {testConfiguration} from './config'

export async function createTempEmptyDir(): Promise<string> {
  const tempGitDirPath = await createTempDir()
  return tempGitDirPath
}

export async function createInitializedTempGnuPGHomeDir(): Promise<string> {
  const tempGnuPGHomeDir = await createTempDir()
  const keygrip = testConfiguration().gpg_signing_key.keygrip
  const gpgPrivateKey = testConfiguration().gpg_signing_key.private_key
  const passphrase = testConfiguration().gpg_signing_key.passphrase

  await gpg.overwriteAgentConfiguration(gpg.agentConfig, tempGnuPGHomeDir)

  await openpgp.readPrivateKey(gpgPrivateKey)

  await gpg.importKey(gpgPrivateKey, tempGnuPGHomeDir)

  await gpg.presetPassphrase(keygrip, passphrase, tempGnuPGHomeDir)

  return tempGnuPGHomeDir
}

export async function newSimpleGit(baseDir: string): Promise<SimpleGit> {
  return simpleGit(baseDir)
}

export async function createInitializedTempGitDir(): Promise<string> {
  const gitRepoDir = await createTempEmptyDir()
  const git = await newSimpleGit(gitRepoDir)
  await git.init()
  return gitRepoDir
}

export function dummyPayload(): string {
  return JSON.stringify({
    field: 'value'
  })
}

export function gitLogForLatestCommit(gitRepoDir: string): string {
  const output = cp
    .execFileSync('git', ['log', '--show-signature', '-n1'], {
      cwd: gitRepoDir
    })
    .toString()
  return output
}
