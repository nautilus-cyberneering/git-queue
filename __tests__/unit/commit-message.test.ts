import {CommitBody} from '../../src/commit-body'
import {CommitMessage} from '../../src/commit-message'
import {CommitSubject} from '../../src/commit-subject'

describe('CommitMessage', () => {
  it('should contain a subject and a body', () => {
    const subject = new CommitSubject('subject')
    const body = new CommitBody('body')

    const commitMessage = new CommitMessage(subject, body)

    expect(commitMessage.subject.equalsTo(subject)).toBe(true)
    expect(commitMessage.body.equalsTo(body)).toBe(true)
  })

  it('should return the commit message ready to use with simple-git package', () => {
    const subject = new CommitSubject('subject')
    const body = new CommitBody('body')
    const commitMessage = new CommitMessage(subject, body)

    const message = commitMessage.forSimpleGit()

    expect(message).toStrictEqual(['subject', 'body'])
  })

  it('can be instantiate passing the text of the subject and body', () => {
    const message = CommitMessage.fromText('subject', 'body')

    expect(
      message.equalsTo(
        new CommitMessage(new CommitSubject('subject'), new CommitBody('body'))
      )
    ).toBe(true)
  })
})
