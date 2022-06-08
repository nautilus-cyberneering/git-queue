import {CommitResult, DefaultLogFields, LogResult, SimpleGit} from 'simple-git'
import {CommitMessage} from './commit-message'
import {CommitOptions} from './commit-options'
import {GitDirNotInitializedError} from './errors'
import {GitRepoDir} from './git-repo-dir'

export class GitRepo {
  private readonly dir: GitRepoDir
  private readonly git: SimpleGit

  constructor(dir: GitRepoDir, git: SimpleGit) {
    this.dir = dir
    this.git = git
  }

  async isInitialized(): Promise<boolean> {
    try {
      await this.git.raw('status')
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

  async log(): Promise<LogResult<DefaultLogFields>> {
    return await this.git.log()
  }

  async hasCommits(): Promise<boolean> {
    await this.guardThatRepoIsInitialized()
    try {
      await this.git.raw('log', '-n', '0')
    } catch (err) {
      // No commits yet
      return false
    }
    return true
  }

  async guardThatRepoIsInitialized(): Promise<void> {
    if (!(await this.isInitialized())) {
      throw new GitDirNotInitializedError(this.dir.getDirPath())
    }
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
