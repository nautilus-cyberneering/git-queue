import {CommitBody} from '../../src/commit-body'
import {NewJobMessage} from '../../src/message'

describe('CommitBody', () => {
  it('should contain a text', () => {
    const commitBody = new CommitBody('{"payload":"test"}')

    expect(commitBody.toString()).toBe('{"payload":"test"}')
  })

  it('could be built from a Message', () => {
    const commitBody = CommitBody.fromMessage(new NewJobMessage('test'))

    expect(commitBody.toString()).toBe('{"payload":"test"}')
  })
})
