import {NewJobMessage} from '../../src/message'

describe('Message', () => {
  it('should have payload', () => {
    const message = new NewJobMessage('payload')
    expect(message.getPayload()).toBe('payload')
  })

  it('could have an optional reference (commit hash) to another job', () => {
    const message = new NewJobMessage(
      'payload',
      'f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
    )
    expect(message.getJobRef()).toBe('f1a69d48a01cc130a64aeac5eaf762e4ba685de7')
  })

  it('should return the job ref', () => {
    const message = new NewJobMessage(
      'payload',
      'f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
    )
    expect(message.getJobRef()).toBe('f1a69d48a01cc130a64aeac5eaf762e4ba685de7')
  })
})
