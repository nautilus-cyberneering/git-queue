import {JobFinishedMessage, NewJobMessage} from '../../src/message'
import {CommitHash} from '../../src/commit-hash'

describe('Message', () => {
  it('should have a payload', () => {
    const message = new NewJobMessage('payload', 0)
    expect(message.getPayload()).toBe('payload')
  })

  it('could have an optional reference (commit hash) to another job', () => {
    const hash = new CommitHash('f1a69d48a01cc130a64aeac5eaf762e4ba685de7')

    const message = new JobFinishedMessage('payload', 0, hash)

    expect(message.getJobRef().equalsTo(hash)).toBe(true)
  })

  it('should allow to omit the job reference', () => {
    const message = new NewJobMessage('payload', 0)

    expect(message.getJobRef().isNull()).toBe(true)
  })

  it('should indicate if it has a job ref', () => {
    const messageWithoutJobRef = new NewJobMessage('payload', 0)
    expect(messageWithoutJobRef.hasJobRef()).toBe(false)

    const hash = new CommitHash('f1a69d48a01cc130a64aeac5eaf762e4ba685de7')
    const messageWithJobRef = new JobFinishedMessage('payload', 0, hash)
    expect(messageWithJobRef.hasJobRef()).toBe(true)
  })
})
