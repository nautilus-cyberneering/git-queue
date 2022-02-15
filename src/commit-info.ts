import {CommitHash, nullCommitHash} from './commit-hash'
import {DefaultLogFields} from 'simple-git'

export class CommitInfo {
  hash: CommitHash
  date: string
  message: string
  refs: string
  body: string
  authorName: string
  authorEmail: string

  constructor(
    hash: CommitHash,
    date: string,
    message: string,
    refs: string,
    body: string,
    authorName: string,
    authorEmail: string
  ) {
    this.hash = hash
    this.date = date
    this.message = message
    this.refs = refs
    this.body = body
    this.authorName = authorName
    this.authorEmail = authorEmail
  }

  static fromDefaultLogFields(defaultLogFields: DefaultLogFields): CommitInfo {
    return new CommitInfo(
      new CommitHash(defaultLogFields.hash),
      defaultLogFields.date,
      defaultLogFields.message,
      defaultLogFields.refs,
      defaultLogFields.body,
      defaultLogFields.author_name,
      defaultLogFields.author_email
    )
  }
}

export function nullCommitInfo(): CommitInfo {
  return new CommitInfo(nullCommitHash(), '', '', '', '', '', '')
}
