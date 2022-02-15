import {CommitBody} from '../../src/commit-body'

describe('CommitBody', () => {
  it('should contain a text', () => {
    const commitBody = new CommitBody('text')

    expect(commitBody.text).toBe('text')
  })
})
