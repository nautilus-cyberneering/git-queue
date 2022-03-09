import {GitDirNotFoundError} from './errors'
import {existsSync} from 'fs'

export class GitRepoDir {
  private readonly dirPath: string

  constructor(dirPath: string) {
    if (!existsSync(dirPath)) {
      throw new GitDirNotFoundError(dirPath)
    }
    this.dirPath = dirPath
  }

  getDirPath(): string {
    return this.dirPath
  }

  equalsTo(other: GitRepoDir): boolean {
    return this.dirPath === other.dirPath
  }
}
