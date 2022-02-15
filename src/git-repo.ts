import {
  CheckRepoActions,
  CommitResult,
  DefaultLogFields,
  GitResponseError,
  LogResult,
  SimpleGit
} from 'simple-git'
import {CommitMessage} from './commit-message'
import {CommitOptions} from './commit-options'
import {GitRepoDir} from './git-repo-dir'

export class GitRepo {
  private readonly dir: GitRepoDir
  private readonly git: SimpleGit

  constructor(dir: GitRepoDir, git: SimpleGit) {
    this.dir = dir
    this.git = git
  }

  async isInitialized(): Promise<boolean> {
    return (await this.git.checkIsRepo(CheckRepoActions.IS_REPO_ROOT))
      ? true
      : false
  }

  getDir(): GitRepoDir {
    return this.dir
  }

  getDirPath(): string {
    return this.dir.getDirPath()
  }

  getGit(): SimpleGit {
    return this.git
  }

  async init(): Promise<void> {
    await this.git.init()
  }

  async getCurrentBranch(): Promise<string | null> {
    const status = await this.git.status()
    return status.current
  }

  async log(): Promise<LogResult<DefaultLogFields>> {
    return await this.git.log()
  }

  async hasCommits(): Promise<boolean> {
    // TODO: find a better way to check if the repo has commits
    const currentBranch = await this.getCurrentBranch()
    try {
      await this.log()
    } catch (err) {
      if (
        (err as GitResponseError).message.includes(
          `fatal: your current branch '${currentBranch}' does not have any commits yet`
        )
      ) {
        // No commits yet
        return false
      } else {
        throw err
      }
    }
    return true
  }

  async commit(
    commitMessage: CommitMessage,
    commitOptions: CommitOptions
  ): Promise<CommitResult> {
    return await this.git.commit(
      commitMessage.forSimpleGit(),
      commitOptions.forSimpleGit()
    )
  }
}
