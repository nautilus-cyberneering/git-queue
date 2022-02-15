import {CommitBody} from '../../src/commit-body'
import {NewJobMessage} from '../../src/message'

describe('CommitBody', () => {
  it('should contain a text', () => {
    const commitBody = new CommitBody('text')

    expect(commitBody.text).toBe('text')
  })

  it('could be built from a Message', () => {
    const commitBody = CommitBody.fromMessage(new NewJobMessage('text'))

    expect(commitBody.text).toBe('text')
  })
})
