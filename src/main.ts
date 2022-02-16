import * as context from './context'
import * as core from '@actions/core'

import {CommitAuthor, nullCommitAuthor} from './commit-author'
import {SigningKeyId, nullSigningKeyId} from './signing-key-id'

import {CommitOptions} from './commit-options'
import {GitRepo} from './git-repo'
import {GitRepoDir} from './git-repo-dir'
import {Inputs} from './context'
import {Queue} from './queue'
import {QueueName} from './queue-name'

import {createGitInstance} from './simple-git-factory'
import {getErrorMessage} from './error'
import {getGnupgHome} from './gpg-env'

const ACTION_CREATE_JOB = 'create-job'
const ACTION_NEXT_JOB = 'next-job'
const ACTION_FINISH_JOB = 'finish-job'

function actionOptions(): string {
  const options = [ACTION_CREATE_JOB, ACTION_NEXT_JOB, ACTION_FINISH_JOB]
  return options.join(', ')
}

async function getCommitAuthorFromInputs(
  commitAuthor: string
): Promise<CommitAuthor> {
  if (commitAuthor) {
    return CommitAuthor.fromEmailAddressString(commitAuthor)
  }
  return nullCommitAuthor()
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
  const author = await getCommitAuthorFromInputs(inputs.gitCommitAuthor)
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
        const createJobCommit = await queue.createJob(inputs.jobPayload)

        await core.group(`Setting outputs`, async () => {
          context.setOutput('job_created', true)
          context.setOutput('job_commit', createJobCommit.hash.toString())

          core.info(`job_created: true`)
          core.info(`job_commit: ${createJobCommit.hash}`)
        })

        break
      }
      case ACTION_NEXT_JOB: {
        const nextJob = queue.getNextJob()

        await core.group(`Setting outputs`, async () => {
          context.setOutput('job_found', !nextJob.isNull())

          if (!nextJob.isNull()) {
            context.setOutput('job_commit', nextJob.commitHash().toString())
            context.setOutput('job_payload', nextJob.payload())

            core.info(`job_commit: ${nextJob.commitHash()}`)
            core.info(`job_payload: ${nextJob.payload()}`)
          }
        })

        break
      }
      case ACTION_FINISH_JOB: {
        const markJobAsFinishedCommit = await queue.markJobAsFinished(
          inputs.jobPayload
        )

        await core.group(`Setting outputs`, async () => {
          context.setOutput('job_finished', true)
          context.setOutput(
            'job_commit',
            markJobAsFinishedCommit.hash.toString()
          )

          core.info(`job_finished: true`)
          core.info(`job_commit: ${markJobAsFinishedCommit.hash}`)
        })

        break
      }
      default: {
        core.error(`Invalid action. Actions can only be: ${actionOptions()}`)
      }
    }
  } catch (error) {
    core.setFailed(getErrorMessage(error))
  }
}

run()
