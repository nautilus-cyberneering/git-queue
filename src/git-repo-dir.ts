import {GitDirNotFoundError} from './errors'
import {existsSync} from 'fs'
import {isAbsolute, resolve} from 'path'

export class GitRepoDir {
  private readonly dirPath: string

  constructor(dirPath: string) {
    this.checkPath(dirPath)
    this.dirPath = this.normalizePath(dirPath)
  }

  checkPath(dirPath) {
    if (!existsSync(dirPath)) {
      throw new GitDirNotFoundError(dirPath)
    }
  }

  normalizePath(dirPath): string {
    return isAbsolute(dirPath) ? resolve(dirPath) : dirPath
  }

  getDirPath(): string {
    return this.dirPath
  }

  equalsTo(other: GitRepoDir): boolean {
    return this.dirPath === other.dirPath
  }
}
