import {QueueName, nullQueueName} from '../../src/queue-name'

describe('QueueName', () => {
  it('should contain the name of a queue', () => {
    const queueName = new QueueName('queue-name')

    expect(queueName.toString()).toBe('queue-name')
  })

  it('should compare two queue names', () => {
    const queueName1 = new QueueName('queue-name-1')
    const queueName2 = new QueueName('queue-name-2')

    expect(queueName1.equalsTo(queueName1)).toBe(true)
    expect(queueName1.equalsTo(queueName2)).toBe(false)
  })

  it('should be nullable', () => {
    const queueName = nullQueueName()

    expect(queueName.isNull()).toBe(true)
  })
})
