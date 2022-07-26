import {isAbsolute, resolve} from 'path'
import {GitDirNotFoundError} from './errors'
import {existsSync} from 'fs'

export class GitRepoDir {
  private readonly dirPath: string

  constructor(dirPath: string) {
    this.guardThatDirExists(dirPath)
    this.dirPath = this.normalizePath(dirPath)
  }

  guardThatDirExists(dirPath: string): void {
    if (!existsSync(dirPath)) {
      throw new GitDirNotFoundError(dirPath)
    }
  }

  normalizePath(dirPath: string): string {
    // nosemgrep
    return isAbsolute(dirPath) ? dirPath : resolve(dirPath)
  }

  getDirPath(): string {
    return this.dirPath
  }

  equalsTo(other: GitRepoDir): boolean {
    return this.dirPath === other.dirPath
  }
}
