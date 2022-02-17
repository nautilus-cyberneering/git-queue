import {
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
    return await this.git.checkIsRepo()
  }

  getDir(): GitRepoDir {
    return this.dir
  }

  getDirPath(): string {
    return this.dir.getDirPath()
  }

  async init(): Promise<void> {
    await this.git.init()
  }

  env(name: string, value: string): void {
    this.git.env(name, value)
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
    // TODO: Code Review. Should we use our own CommitResult class?
    // We could return always the 40-character commit hash with:
    // const longCommit = await git.show([commit, '--pretty=%H', '-s']);
    // Related issue: https://github.com/steveukx/git-js/issues/757
    return await this.git.commit(
      commitMessage.forSimpleGit(),
      commitOptions.forSimpleGit()
    )
  }
}
