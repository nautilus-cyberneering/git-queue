import {CommitBody} from '../../src/commit-body'
import {NewJobMessage} from '../../src/message'
import {dummyCommitBodyText} from '../../src/__tests__/helpers'

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
      new NewJobMessage('message-payload')
    )

    const builtBody = JSON.stringify({
      namespace: 'git-queue.commit-body',
      version: 1,
      metadata: {},
      payload: 'message-payload'
    })

    expect(commitBody.toString()).toBe(builtBody)
  })
})
