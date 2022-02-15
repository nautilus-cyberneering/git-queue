import * as context from './context'
import * as core from '@actions/core'

import {CommitAuthor, nullCommitAuthor} from './commit-author'
import {SigningKeyId, nullSigningKeyId} from './signing-key-id'

import {CommitOptions} from './commit-options'
import {Inputs} from './context'
import {Queue} from './queue'
import {QueueName} from './queue-name'

import {createInstance} from './simple-git-factory'
import {getErrorMessage} from './error'
import {getGnupgHome} from './gpg-env'

const ACTION_CREATE_JOB = 'create-job'
const ACTION_NEXT_JOB = 'next-job'
const ACTION_FINISH_JOB = 'finish-job'

function actionOptions(): string {
  const options = [ACTION_CREATE_JOB, ACTION_NEXT_JOB, ACTION_FINISH_JOB]
  return options.join(', ')
}

async function getCommitAuthor(commitAuthor: string): Promise<CommitAuthor> {
  if (commitAuthor) {
    return CommitAuthor.fromEmailAddressString(commitAuthor)
  }
  return nullCommitAuthor()
}

async function getSigningKeyId(signingKeyId: string): Promise<SigningKeyId> {
  if (signingKeyId) {
    return new SigningKeyId(signingKeyId)
  }
  return nullSigningKeyId()
}

async function getCommitOptions(inputs: Inputs): Promise<CommitOptions> {
  const author = await getCommitAuthor(inputs.gitCommitAuthor)
  const gpgSign = await getSigningKeyId(inputs.gitCommitGpgSign)
  const noGpgSig = inputs.gitCommitNoGpgSign

  return new CommitOptions(author, gpgSign, noGpgSig)
}

async function run(): Promise<void> {
  try {
    const inputs: context.Inputs = await context.getInputs()

    const gitRepoDir =
      inputs.gitRepoDir !== '' ? inputs.gitRepoDir : process.cwd()
    const gnuPGHomeDir = await getGnupgHome()

    await core.group(`Debug info`, async () => {
      core.info(
        `git_repo_dir input: ${inputs.gitRepoDir} ${typeof inputs.gitRepoDir}`
      )
      core.info(`git_repo_dir: ${gitRepoDir}`)
      core.info(`gnupg_home_dir: ${gnuPGHomeDir}`)
    })

    const git = await createInstance(gitRepoDir)

    const commitOptions = await getCommitOptions(inputs)

    const queue = await Queue.create(
      new QueueName(inputs.queueName),
      gitRepoDir,
      git,
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
