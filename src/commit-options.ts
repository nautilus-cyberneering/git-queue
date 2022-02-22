import {CommitAuthor} from './commit-author'
import {SigningKeyId} from './signing-key-id'
import {TaskOptions} from 'simple-git'

export class CommitOptions {
  author: CommitAuthor
  gpgSig: SigningKeyId
  noGpgSig: boolean

  constructor(author: CommitAuthor, gpgSig: SigningKeyId, noGpgSig: boolean) {
    this.author = author
    this.gpgSig = gpgSig
    this.noGpgSig = noGpgSig
  }

  forSimpleGit(): TaskOptions {
    return {
      '--allow-empty': null,
      '--author': `"${this.author.toString()}"`,
      ...(!this.gpgSig.isNull() && {
        '--gpg-sign': this.gpgSig.toString()
      }),
      ...(this.noGpgSig && {'--no-gpg-sign': null})
    }
  }

  toString(): string {
    const allowEmpty = '--allow-empty'
    const author = `--author="${this.author.toString()}"`
    const gpgSig = this.gpgSig.isNull()
      ? ''
      : `--gpg-sign=${this.gpgSig.toString()}`
    const noGpgSig = this.noGpgSig ? '--no-gpg-sign' : ''
    return `${allowEmpty} ${author} ${gpgSig} ${noGpgSig}`
  }
}
