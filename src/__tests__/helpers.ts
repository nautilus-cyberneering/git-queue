import * as cp from 'child_process'
import * as gpg from './gpg'
import * as openpgp from './openpgp'

import simpleGit, {SimpleGit} from 'simple-git'

import {GitRepo} from '../git-repo'
import {GitRepoDir} from '../git-repo-dir'

import {createTempDir} from 'jest-fixtures'
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

export async function newSimpleGitWithCommitterIdentity(
  gitRepoDir: string
): Promise<SimpleGit> {
  const git = await newSimpleGitWithoutCommitterIdentity(gitRepoDir)
  git.init()
  //git.addConfig('user.name', testConfiguration().git.user.name)
  //git.addConfig('user.email', testConfiguration().git.user.email)
  return git
}

export async function newSimpleGitWithoutCommitterIdentity(
  gitRepoDir: string
): Promise<SimpleGit> {
  const git = await newSimpleGit(gitRepoDir)
  return git
}

export async function createInitializedTempGitDir(): Promise<string> {
  const gitRepoDir = await createTempEmptyDir()
  const git = await newSimpleGit(gitRepoDir)
  await git.init()
  return gitRepoDir
}

export async function createInitializedGitRepo(): Promise<GitRepo> {
  const gitRepoDirPath = await createTempEmptyDir()
  const git = await newSimpleGitWithCommitterIdentity(gitRepoDirPath)
  const gitRepo = new GitRepo(new GitRepoDir(gitRepoDirPath), git)
  return gitRepo
}

export async function createNotInitializedGitRepo(): Promise<GitRepo> {
  const gitRepoDirPath = await createTempEmptyDir()
  const git = await newSimpleGitWithoutCommitterIdentity(gitRepoDirPath)
  const gitRepo = new GitRepo(new GitRepoDir(gitRepoDirPath), git)
  return gitRepo
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
    .trim()
  return output
}

export function getLatestCommitHash(gitRepoDir: string): string {
  const output = cp
    .execFileSync('git', ['show', '--pretty=%H', '-s', 'HEAD'], {
      cwd: gitRepoDir
    })
    .toString()
    .trim()
  return output
}
