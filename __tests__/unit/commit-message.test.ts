import {CommitBody} from '../../src/commit-body'
import {CommitMessage} from '../../src/commit-message'
import {CommitSubjectParser} from '../../src/commit-subject-parser'

function dummyCommitSubjectText(): string {
  return '📝🈺: queue-name: job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
}

describe('CommitMessage', () => {
  it('should contain a subject and a body', () => {
    const subject = CommitSubjectParser.parseText(dummyCommitSubjectText())
    const body = new CommitBody('{ "payload": "test" }')

    const commitMessage = new CommitMessage(subject, body)

    expect(commitMessage.subject.equalsTo(subject)).toBe(true)
    expect(commitMessage.body.equalsTo(body)).toBe(true)
  })

  it('should return the commit message ready to use with simple-git package', () => {
    const subject = CommitSubjectParser.parseText(dummyCommitSubjectText())
    const body = new CommitBody('{"payload":"test"}')
    const commitMessage = new CommitMessage(subject, body)

    const message = commitMessage.forSimpleGit()

    expect(message).toStrictEqual([
      dummyCommitSubjectText(),
      '{"payload":"test"}'
    ])
  })

  it('can be instantiate passing the text of the subject and body', () => {
    const message = CommitMessage.fromText(
      dummyCommitSubjectText(),
      '{"payload":"test"}'
    )

    expect(
      message.equalsTo(
        new CommitMessage(
          CommitSubjectParser.parseText(dummyCommitSubjectText()),
          new CommitBody('{"payload":"test"}')
        )
      )
    ).toBe(true)
  })
})
