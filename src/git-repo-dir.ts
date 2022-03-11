import {isAbsolute, resolve} from 'path'
import {GitDirNotFoundError} from './errors'
import {existsSync} from 'fs'

export class GitRepoDir {
  private readonly dirPath: string

  constructor(dirPath: string) {
    this.checkPath(dirPath)
    this.dirPath = this.normalizePath(dirPath)
  }

  checkPath(dirPath): void {
    if (!existsSync(dirPath)) {
      throw new GitDirNotFoundError(dirPath)
    }
  }

  normalizePath(dirPath): string {
    return isAbsolute(dirPath) ? dirPath : resolve(dirPath)
  }

  getDirPath(): string {
    return this.dirPath
  }

  equalsTo(other: GitRepoDir): boolean {
    return this.dirPath === other.dirPath
  }
}
