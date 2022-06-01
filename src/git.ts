import {GitRepoDir} from './git-repo-dir'
import {execFileSync} from 'child_process'

/**
 * For now, this class is only used to detect some corner cases in a git repo.
 * There are cases where the Git console command returns an error. For example:
 *
 * In a not initialized Git repo:
 *
 * git status && echo "OK"
 * fatal: not a git repository (or any of the parent directories): .git
 *
 * git log && echo "OK"
 * fatal: not a git repository (or any of the parent directories): .git
 *
 * In a initialized Git repo but without any commits:
 *
 * git init && git log && echo "OK"
 * Initialized empty Git repository in /tmp/test/.git/
 * fatal: your current branch 'main' does not have any commits yet
 */
export class Git {
  private readonly dir: GitRepoDir

  constructor(dir: GitRepoDir) {
    this.dir = dir
  }

  execSync(args?: readonly string[]): string | Buffer {
    const cmd = `git`
    return execFileSync(cmd, args, {
      stdio: 'ignore',
      cwd: this.dir.getDirPath()
    })
  }

  status(): string | Buffer {
    const args: readonly string[] = ['status']
    return this.execSync(args)
  }

  log(): string | Buffer {
    const args: readonly string[] = ['log', '-n', '0']
    return this.execSync(args)
  }

  init(): string | Buffer {
    const args: readonly string[] = ['init']
    return this.execSync(args)
  }

  emptyCommit(message: string): string | Buffer {
    const args: readonly string[] = ['commit', '--allow-empty', '-m', message]
    return this.execSync(args)
  }
}
