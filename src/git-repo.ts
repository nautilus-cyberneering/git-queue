import {CommitResult, DefaultLogFields, LogResult, SimpleGit} from 'simple-git'
import {CommitMessage} from './commit-message'
import {CommitOptions} from './commit-options'
import {GitDirNotInitializedError} from './errors'
import {GitRepoDir} from './git-repo-dir'
import {execSync} from 'child_process'
import {existsSync} from 'fs'

export class GitRepo {
  private readonly dir: GitRepoDir
  private readonly git: SimpleGit

  constructor(dir: GitRepoDir, git: SimpleGit) {
    this.dir = dir
    this.git = git
  }

  isInitialized(): boolean {
    try {
      // Make sure the string we will pass to to the shell is an actual dir
      if (!existsSync(this.dir.getDirPath())) {
        throw new Error()
      }
      execSync(`git -C ${this.getDirPath()} status`, {stdio: 'ignore'})
    } catch {
      return false
    }
    return true
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
    if (!this.isInitialized()) {
      throw new GitDirNotInitializedError(this.dir.getDirPath())
    }
    try {
      // Make sure the string we will pass to to the shell is an actual dir
      if (!existsSync(this.dir.getDirPath())) {
        throw new Error()
      }
      execSync(`git -C ${this.dir.getDirPath()} log -n 0`, {stdio: 'ignore'})
    } catch (err) {
      // No commits yet
      return false
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
