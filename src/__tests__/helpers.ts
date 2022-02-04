import * as cp from 'child_process'
import simpleGit, {SimpleGit} from 'simple-git'
import {createTempDir} from 'jest-fixtures'
import * as openpgp from './openpgp'
import * as gpg from './gpg'
import {testConfiguration} from './config'

export async function createTempEmptyDir(): Promise<string> {
  const tempGitDirPath = await createTempDir()
  return tempGitDirPath
}

export async function createInitializedTempGnuPGHomeDir(
  debug = false
): Promise<string> {
  const tempGnuPGHomeDir = await createTempDir()
  const keygrip = testConfiguration().gpg_signing_key.keygrip
  const gpgPrivateKey = testConfiguration().gpg_signing_key.private_key
  const passphrase = testConfiguration().gpg_signing_key.passphrase

  if (debug) {
    console.log(`GnuPG homedir: ${tempGnuPGHomeDir}`)
  }

  await gpg.overwriteAgentConfiguration(gpg.agentConfig, tempGnuPGHomeDir)

  const privateKey = await openpgp.readPrivateKey(gpgPrivateKey)
  if (debug) {
    console.log(`Fingerprint primary key: ${privateKey.fingerprint}`)
  }

  if (debug) {
    console.log('Importing key ...')
  }

  await gpg.importKey(gpgPrivateKey, tempGnuPGHomeDir).then(stdout => {
    if (debug) {
      console.log(stdout)
    }
  })

  if (debug) {
    console.log(`Presetting passphrase for ${keygrip}`)
  }
  await gpg
    .presetPassphrase(keygrip, passphrase, tempGnuPGHomeDir)
    .then(stdout => {
      if (debug) {
        console.log(stdout)
      }
    })

  return tempGnuPGHomeDir
}

export async function newSimpleGit(
  baseDir: string,
  initializeGit = false
): Promise<SimpleGit> {
  const git = simpleGit(baseDir)
  if (initializeGit) {
    await git.init()
  }
  return git
}

export async function createInitializedTempGitDir() {
  const gitRepoDir = await createTempEmptyDir()
  const git = await newSimpleGit(gitRepoDir, true)
  return gitRepoDir
}

export function dummyPayload() {
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
