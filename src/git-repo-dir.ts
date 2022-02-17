export class GitRepoDir {
  private readonly dirPath: string

  constructor(dirPath: string) {
    // TODO: validate dir path
    this.dirPath = dirPath
  }

  getDirPath(): string {
    return this.dirPath
  }

  equalsTo(other: GitRepoDir): boolean {
    return this.dirPath === other.dirPath
  }
}
