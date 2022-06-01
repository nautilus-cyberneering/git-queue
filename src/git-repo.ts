import {CommitResult, DefaultLogFields, LogResult, SimpleGit} from 'simple-git'
import {CommitMessage} from './commit-message'
import {CommitOptions} from './commit-options'
import {GitDirNotInitializedError} from './errors'
import {GitRepoDir} from './git-repo-dir'
import {Git} from './git'

export class GitRepo {
  private readonly dir: GitRepoDir
  private readonly git: SimpleGit

  constructor(dir: GitRepoDir, git: SimpleGit) {
    this.dir = dir
    this.git = git
  }

  isInitialized(): boolean {
    try {
      const git = new Git(this.dir)
      git.status()
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
      const git = new Git(this.dir)
      git.log()
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
    return await this.git.commit(
      commitMessage.forSimpleGit(),
      commitOptions.forSimpleGit()
    )
  }
}
