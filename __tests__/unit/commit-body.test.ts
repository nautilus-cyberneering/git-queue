import {CommitBody} from '../../src/commit-body'
import {NewJobMessage} from '../../src/message'

describe('CommitBody', () => {
  it('should contain a text', () => {
    const commitBody = new CommitBody('{"payload":"test"}')

    expect(commitBody.toString()).toBe('{"payload":"test"}')
  })

  it('should accept a metadata structure', () => {
    const commitBody = new CommitBody(
      '{"payload":"test","metadata":{"version":1,"data":"abc"}}'
    )

    expect(commitBody.toString()).toBe(
      '{"payload":"test","metadata":{"version":1,"data":"abc"}}'
    )
  })

  it('should not accept a metadata without the mandatory version field', () => {
    const invalidContent = (): CommitBody => {
      return new CommitBody('{"payload":"test","metadata":{"data":"abc"}}')
    }
    expect(invalidContent).toThrowError()
  })

  it('should fail when constructing with a non-JSON content', () => {
    const invalidContent = (): CommitBody => {
      return new CommitBody('this is not a JSON content')
    }
    expect(invalidContent).toThrowError()
  })

  it('should fail when constructing with a JSON content that does not comply with the schema', () => {
    const invalidContent = (): CommitBody => {
      return new CommitBody('this is not a JSON content')
    }
    expect(invalidContent).toThrowError()
  })

  it('could be built from a Message', () => {
    const commitBody = CommitBody.fromMessage(new NewJobMessage('test'))

    expect(commitBody.toString()).toBe('{"payload":"test"}')
  })
})
