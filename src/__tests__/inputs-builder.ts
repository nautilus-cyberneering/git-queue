import {createInitializedGitRepo, dummyPayload} from './helpers'
import {GitRepo} from '../git-repo'

interface ActionInputs {
  INPUT_QUEUE_NAME: string
  INPUT_GIT_REPO_DIR: string
  INPUT_ACTION: string
  INPUT_JOB_PAYLOAD: string
  INPUT_GIT_COMMIT_NO_GPG_SIGN: string
}

const DEFAULT_QUEUE_NAME = 'queue-name'
const DEFAULT_ACTION = 'create-job'

export class InputsBuilder {
  private queueName: string | null
  private gitRepo: GitRepo | null
  private action: string | null
  private payload: string | null
  private noGpgSign: boolean

  constructor() {
    this.queueName = null
    this.gitRepo = null
    this.action = null
    this.payload = null
    this.noGpgSign = true
  }

  static instance(): InputsBuilder {
    return new InputsBuilder()
  }

  withNoGpgSignature(): InputsBuilder {
    this.noGpgSign = true
    return this
  }

  async buildInputs(): Promise<ActionInputs> {
    if (this.queueName === null) {
      this.queueName = DEFAULT_QUEUE_NAME
    }

    if (this.gitRepo === null) {
      this.gitRepo = await createInitializedGitRepo()
    }

    if (this.action === null) {
      this.action = DEFAULT_ACTION
    }

    if (this.payload === null) {
      this.payload = dummyPayload()
    }

    return {
      INPUT_QUEUE_NAME: this.queueName,
      INPUT_GIT_REPO_DIR: this.gitRepo.getDirPath(),
      INPUT_ACTION: this.action,
      INPUT_JOB_PAYLOAD: this.payload,
      INPUT_GIT_COMMIT_NO_GPG_SIGN: this.noGpgSign ? 'true' : 'false'
    }
  }
}
