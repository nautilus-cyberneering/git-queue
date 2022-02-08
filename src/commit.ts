import {DefaultLogFields} from 'simple-git'

export class Commit {
  hash: string

  constructor(hash: string) {
    this.hash = hash
  }
}

export function nullCommit(): DefaultLogFields {
  return {
    hash: '',
    date: '',
    message: '',
    refs: '',
    body: '',
    author_name: '',
    author_email: ''
  }
}
