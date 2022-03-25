import * as cp from 'child_process'
import * as gpg from './gpg'
import * as openpgp from './openpgp'

import simpleGit, {SimpleGit, SimpleGitOptions} from 'simple-git'

import {CommitHash} from '../commit-hash'
import {GitRepo} from '../git-repo'
import {GitRepoDir} from '../git-repo-dir'

import {createTempDir} from 'jest-fixtures'
import {join} from 'path'
import {testConfiguration} from './config'

export async function createTempEmptyDir(): Promise<string> {
  const tempGitDirPath = await createTempDir()
  return tempGitDirPath
}

export async function createInexistentTempDir(): Promise<string> {
  return join(await createTempEmptyDir(), `inexistent`)
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
  gitRepoDir: GitRepoDir
): Promise<SimpleGit> {
  const options: Partial<SimpleGitOptions> = {
    baseDir: gitRepoDir.getDirPath(),
    config: [
      `user.name=${testConfiguration().git.user.name}`,
      `user.email=${testConfiguration().git.user.email}`
    ]
  }
  const git = simpleGit(options)
  return git
}

export async function newSimpleGitWithoutCommitterIdentity(
  gitRepoDir: string
): Promise<SimpleGit> {
  const git = await newSimpleGit(gitRepoDir)
  return git
}

export async function createInitializedGitRepo(): Promise<GitRepo> {
  const gitRepoDir = new GitRepoDir(await createTempEmptyDir())
  const git = await newSimpleGitWithCommitterIdentity(gitRepoDir)
  const gitRepo = new GitRepo(gitRepoDir, git)
  await gitRepo.init()
  return gitRepo
}

export async function createNotInitializedGitRepo(): Promise<GitRepo> {
  const gitRepoDirPath = await createTempEmptyDir()
  const git = await newSimpleGitWithoutCommitterIdentity(gitRepoDirPath)
  const gitRepo = new GitRepo(new GitRepoDir(gitRepoDirPath), git)
  return gitRepo
}

export function dummyPayload(): string {
  return 'test'
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

export function getLatestCommitHash(gitRepoDir: GitRepoDir): CommitHash {
  const output = cp
    .execFileSync('git', ['show', '--pretty=%H', '-s', 'HEAD'], {
      cwd: gitRepoDir.getDirPath()
    })
    .toString()
    .trim()
  return new CommitHash(output)
}

export function getSecondToLatestCommitHash(
  gitRepoDir: GitRepoDir
): CommitHash {
  const output = cp
    .execFileSync('git', ['show', '--pretty=%H', '-s', 'HEAD^1'], {
      cwd: gitRepoDir.getDirPath()
    })
    .toString()
    .trim()
  return new CommitHash(output)
}

export function dummyCommitBodyText(): string {
  return JSON.stringify({
    namespace: 'git-queue.commit-body',
    version: 1,
    payload: 'test',
    metadata: {
      job_number: 1,
      job_commit: 'abc'
    }
  })
}
