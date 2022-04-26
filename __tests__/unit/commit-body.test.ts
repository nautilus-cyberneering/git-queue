import {CommitBody} from '../../src/commit-body'
import {NewJobMessage} from '../../src/message'
import {dummyCommitBodyText} from '../../src/__tests__/helpers'
import {nullCommitHash} from '../../src/commit-hash'

describe('CommitBody', () => {
  it('should contain a text', () => {
    const commitBody = new CommitBody(dummyCommitBodyText())

    expect(commitBody.toString()).toBe(dummyCommitBodyText())
  })

  it('should not accept a body without the mandatory version field', () => {
    const invalidContent = (): CommitBody => {
      return new CommitBody(
        JSON.stringify({
          namespace: 'git-queue.commit-body',
          payload: 'test',
          metadata: {
            job_number: 1,
            job_commit: 'abc'
          }
        })
      )
    }
    expect(invalidContent).toThrowError()
  })

  it('should not accept a body without the mandatory namespace field', () => {
    const invalidContent = (): CommitBody => {
      return new CommitBody(
        JSON.stringify({
          version: 1,
          payload: 'test',
          metadata: {
            job_number: 1,
            job_commit: 'abc'
          }
        })
      )
    }
    expect(invalidContent).toThrowError()
  })

  it('should not accept a body with a wrong namespace value', () => {
    const invalidContent = (): CommitBody => {
      return new CommitBody(
        JSON.stringify({
          namespace: 'wrong.namespace',
          version: 1,
          payload: 'test',
          metadata: {
            job_number: 1,
            job_commit: 'abc'
          }
        })
      )
    }
    expect(invalidContent).toThrowError()
  })

  it('should not accept a body without the mandatory metadata field', () => {
    const invalidContent = (): CommitBody => {
      return new CommitBody(
        JSON.stringify({
          namespace: 'git-queue.commit-body',
          version: 1,
          payload: 'test'
        })
      )
    }
    expect(invalidContent).toThrowError()
  })

  it('should fail when constructing with a non-JSON content', () => {
    const invalidContent = (): CommitBody => {
      return new CommitBody('this is not a JSON content')
    }
    expect(invalidContent).toThrowError()
  })

  it('could be built from a Message', () => {
    const commitBody = CommitBody.fromMessage(
      new NewJobMessage('message-payload', 0)
    )

    const builtBody = JSON.stringify({
      namespace: 'git-queue.commit-body',
      version: 1,
      metadata: {
        job_commit: nullCommitHash().getHash()
      },
      payload: 'message-payload'
    })
    expect(commitBody.toString()).toBe(builtBody)
  })

  it('should compare two bodies', () => {
    const firstCommitBody = new CommitBody(dummyCommitBodyText())
    const secondCommitBody = new CommitBody(dummyCommitBodyText())

    expect(firstCommitBody.equalsTo(secondCommitBody)).toBe(true)

    secondCommitBody.body.payload += ' Suffix'

    expect(firstCommitBody.equalsTo(secondCommitBody)).toBe(false)
  })
})
