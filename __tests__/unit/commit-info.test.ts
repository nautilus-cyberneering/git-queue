import {CommitInfo} from '../../src/commit-info'

describe('CommitInfo', () => {
  it('should have basic commit info', () => {
    const commitInfo = new CommitInfo(
      'hash',
      'date',
      'message',
      'refs',
      'body',
      'author name',
      'author email'
    )

    expect(commitInfo.hash).toBe('hash')
    expect(commitInfo.date).toBe('date')
    expect(commitInfo.message).toBe('message')
    expect(commitInfo.refs).toBe('refs')
    expect(commitInfo.body).toBe('body')
    expect(commitInfo.authorName).toBe('author name')
    expect(commitInfo.authorEmail).toBe('author email')
  })

  it('should be instantiated from the simple-git class DefaultLogFields', () => {
    const commitInfo = CommitInfo.fromDefaultLogFields({
      hash: 'hash',
      date: 'date',
      message: 'message',
      refs: 'refs',
      body: 'body',
      author_name: 'author name',
      author_email: 'author email'
    })

    expect(commitInfo).toBeInstanceOf(CommitInfo)
  })
})
