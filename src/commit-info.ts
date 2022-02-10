import {DefaultLogFields} from 'simple-git'

export class CommitInfo {
  hash: string
  date: string
  message: string
  refs: string
  body: string
  authorName: string
  authorEmail: string

  constructor(
    hash: string,
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
      defaultLogFields.hash,
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
  return new CommitInfo('', '', '', '', '', '', '')
}
