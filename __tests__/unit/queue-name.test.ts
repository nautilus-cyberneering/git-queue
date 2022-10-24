import {QueueName, nullQueueName} from '../../src/queue-name'

describe('QueueName', () => {
  it('should contain the name of a queue', () => {
    const queueName = new QueueName('queue-name')

    expect(queueName.toString()).toBe('queue-name')
  })

  it('should compare two queue names', () => {
    const queueName1 = new QueueName('queue-name-a')
    const queueName2 = new QueueName('queue-name-b')

    expect(queueName1.equalsTo(queueName1)).toBe(true)
    expect(queueName1.equalsTo(queueName2)).toBe(false)
  })

  it('should fail if the queue name is not valid', () => {
    const invalidCharacters = (): QueueName => {
      return new QueueName('123')
    }
    const emptyString = (): QueueName => {
      return new QueueName('')
    }
    const longString = (): QueueName => {
      return new QueueName(
        'this is a very long queue name with more than fifty chars'
      )
    }

    expect(invalidCharacters).toThrow()
    expect(emptyString).toThrow()
    expect(longString).toThrow()
  })

  it('should transform blank spaces of the queue name into dashes', () => {
    expect(new QueueName('queue name_a').value).toBe('queue-name_a')
  })

  it('should be nullable', () => {
    const queueName = nullQueueName()

    expect(queueName.isNull()).toBe(true)
  })
})
