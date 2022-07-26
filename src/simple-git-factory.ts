import {simpleGit, SimpleGit, SimpleGitOptions} from 'simple-git'
import {GitRepoDir} from './git-repo-dir'

export async function createGitInstance(
  gitRepoDir: GitRepoDir
): Promise<SimpleGit> {
  const options: Partial<SimpleGitOptions> = {
    baseDir: gitRepoDir.getDirPath()
  }

  const git: SimpleGit = simpleGit(options)

  /*
   * We need to pass the env vars to the child git process
   * because the user might want to use some env vars like:
   *
   * For GPG:
   * GNUPGHOME
   *
   * For git commit:
   * GIT_AUTHOR_NAME
   * GIT_AUTHOR_EMAIL
   * GIT_AUTHOR_DATE
   * GIT_COMMITTER_NAME
   * GIT_COMMITTER_EMAIL
   * GIT_COMMITTER_DATE
   *
   * TODO: Code review. Should we pass only the env vars used by git commit?
   */
  git.env(process.env)

  return git
}
