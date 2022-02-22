import * as core from '@actions/core'
import {issueCommand} from '@actions/core/lib/command'

export interface Inputs {
  queueName: string
  action: string
  jobPayload: string
  gitRepoDir: string
  gitCommitGpgSign: string
  gitCommitNoGpgSign: boolean
}

export async function getInputs(): Promise<Inputs> {
  return {
    queueName: core.getInput('queue_name', {required: true}),
    action: core.getInput('action', {required: true}),
    jobPayload: core.getInput('job_payload', {required: false}),
    gitRepoDir: core.getInput('git_repo_dir', {required: false}),
    gitCommitGpgSign: core.getInput('git_commit_gpg_sign', {required: false}),
    gitCommitNoGpgSign:
      core.getInput('git_commit_no_gpg_sign', {required: false}) === 'true'
        ? true
        : false
  }
}

// FIXME: Temp fix https://github.com/actions/toolkit/issues/777
export function setOutput(
  name: string,
  value: string | boolean | number
): void {
  issueCommand('set-output', {name}, value)
}
