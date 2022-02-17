import simpleGit, {SimpleGit} from 'simple-git'
import {GitRepoDir} from './git-repo-dir'

async function getGitConfig(
  key: string,
  git: SimpleGit
): Promise<string | null> {
  const option = await git.getConfig(key)
  if (option.value) {
    return option.value
  }
  return null
}

export async function createGitInstance(
  gitRepoDir: GitRepoDir
): Promise<SimpleGit> {
  const git: SimpleGit = simpleGit(gitRepoDir.getDirPath())

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
