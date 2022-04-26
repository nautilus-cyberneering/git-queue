import * as context from './context'
import * as core from '@actions/core'

import {SigningKeyId, nullSigningKeyId} from './signing-key-id'

import {CommitOptions} from './commit-options'
import {GitRepo} from './git-repo'
import {GitRepoDir} from './git-repo-dir'
import {Inputs} from './context'
import {Queue} from './queue'
import {QueueName} from './queue-name'

import {createGitInstance} from './simple-git-factory'
import {getCommitAuthor} from './commit-author'
import {getErrorMessage} from './error'
import {getGnupgHome} from './gpg-env'

const ACTION_CREATE_JOB = 'create-job'
const ACTION_NEXT_JOB = 'next-job'
const ACTION_START_JOB = 'start-job'
const ACTION_FINISH_JOB = 'finish-job'

function listOfActions(): string {
  const options = [
    ACTION_CREATE_JOB,
    ACTION_NEXT_JOB,
    ACTION_START_JOB,
    ACTION_FINISH_JOB
  ]
  return options.join(', ')
}

async function getSigningKeyIdFromInputs(
  signingKeyId: string
): Promise<SigningKeyId> {
  if (signingKeyId) {
    return new SigningKeyId(signingKeyId)
  }
  return nullSigningKeyId()
}

async function getGitRepoDirFromInputs(
  gitRepoDir: string,
  cwd: string
): Promise<GitRepoDir> {
  if (gitRepoDir !== '') {
    return new GitRepoDir(gitRepoDir)
  }
  return new GitRepoDir(cwd)
}

async function getCommitOptionsFromInputs(
  inputs: Inputs
): Promise<CommitOptions> {
  const author = getCommitAuthor()
  const gpgSign = await getSigningKeyIdFromInputs(inputs.gitCommitGpgSign)
  const noGpgSig = inputs.gitCommitNoGpgSign

  return new CommitOptions(author, gpgSign, noGpgSig)
}

async function printDebugInfo(
  gitRepoDir: GitRepoDir,
  gnuPGHomeDir: string
): Promise<void> {
  await core.group(`Debug info`, async () => {
    core.info(`git_repo_dir: ${gitRepoDir.getDirPath()}`)
    core.info(`gnupg_home_dir: ${gnuPGHomeDir}`)
  })
}

async function run(): Promise<void> {
  try {
    const inputs: context.Inputs = await context.getInputs()

    const gitRepoDir = await getGitRepoDirFromInputs(
      inputs.gitRepoDir,
      process.cwd()
    )

    const commitOptions = await getCommitOptionsFromInputs(inputs)

    const gnuPGHomeDir = await getGnupgHome()

    await printDebugInfo(gitRepoDir, gnuPGHomeDir)

    const git = await createGitInstance(gitRepoDir)

    const gitRepo = new GitRepo(gitRepoDir, git)

    const queue = await Queue.create(
      new QueueName(inputs.queueName),
      gitRepo,
      commitOptions
    )

    switch (inputs.action) {
      case ACTION_CREATE_JOB: {
        const job = await queue.createJob(inputs.jobPayload)

        await core.group(`Setting outputs`, async () => {
          context.setOutput('job_created', !job.getCommitHash().isNull())
          context.setOutput('job_commit', job.getCommitHash().toString())
          context.setOutput('job_id', job.getId().toString())

          core.info(`job_created: ${!job.getCommitHash().isNull()}`)
          core.info(`job_commit: ${job.getCommitHash().toString()}`)
          core.info(`job_id: ${job.getId().toString()}`)
        })

        break
      }
      case ACTION_NEXT_JOB: {
        const nextJob = queue.getNextJob()

        await core.group(`Setting outputs`, async () => {
          context.setOutput('job_found', !nextJob.isNull())

          if (!nextJob.isNull()) {
            context.setOutput('job_commit', nextJob.getCommitHash().toString())
            context.setOutput('job_payload', nextJob.getPayload())

            core.info(`job_commit: ${nextJob.getCommitHash()}`)
            core.info(`job_payload: ${nextJob.getPayload()}`)
          }
        })

        break
      }
      case ACTION_START_JOB: {
        const commit = await queue.markJobAsStarted(inputs.jobPayload)

        await core.group(`Setting outputs`, async () => {
          context.setOutput('job_started', !commit.hash.isNull())
          context.setOutput('job_commit', commit.hash.toString())

          core.info(`job_started: ${!commit.hash.isNull()}`)
          core.info(`job_commit: ${commit.hash.toString()}`)
        })

        break
      }
      case ACTION_FINISH_JOB: {
        const commit = await queue.markJobAsFinished(inputs.jobPayload)

        await core.group(`Setting outputs`, async () => {
          context.setOutput('job_finished', !commit.hash.isNull())
          context.setOutput('job_commit', commit.hash.toString())

          core.info(`job_finished: ${!commit.hash.isNull()}`)
          core.info(`job_commit: ${commit.hash.toString()}`)
        })

        break
      }
      default: {
        core.error(`Invalid action. Actions can only be: ${listOfActions()}`)
      }
    }
  } catch (error) {
    core.setFailed(getErrorMessage(error))
  }
}

run()
