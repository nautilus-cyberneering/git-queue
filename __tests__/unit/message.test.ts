import {CommitHash} from '../../src/commit-hash'
import {NewJobMessage} from '../../src/message'

describe('Message', () => {
  it('should have payload', () => {
    const message = new NewJobMessage('payload')
    expect(message.getPayload()).toBe('payload')
  })

  it('could have an optional reference (commit hash) to another job', () => {
    const hash = new CommitHash('f1a69d48a01cc130a64aeac5eaf762e4ba685de7')

    const message = new NewJobMessage('payload', hash)

    expect(message.getJobRef().equalsTo(hash)).toBe(true)
  })

  it('should allow to omit the job reference', () => {
    const message = new NewJobMessage('payload')

    expect(message.getJobRef().isNull()).toBe(true)
  })
})
