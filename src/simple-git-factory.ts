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

  /*
   * It seems the `git` child process does not apply the global git config,
   * at least for the `git commit` command. You have to overwrite local config with the global.
   */

  const userName = await getGitConfig('user.name', git)
  if (userName) {
    git.addConfig('user.name', userName)
  }

  const userEmail = await getGitConfig('user.email', git)
  if (userEmail) {
    git.addConfig('user.email', userEmail)
  }

  const userSigningkey = await getGitConfig('user.signingkey', git)
  if (userSigningkey) {
    git.addConfig('user.signingkey', userSigningkey)
  }

  const commitGpgsign = await getGitConfig('commit.gpgsign', git)
  if (commitGpgsign) {
    git.addConfig('commit.gpgsign', commitGpgsign)
  }

  return git
}
