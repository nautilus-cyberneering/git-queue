import {MessageKey} from '../../src/message-key'

describe('MessageKey', () => {
  it('should contain the unique identifier of a queue message', () => {
    const commitHash = new MessageKey('🈺')

    expect(commitHash.toString()).toBe('🈺')
  })

  it('should compare two message keys', () => {
    const messageKey1 = new MessageKey('🈺')
    const messageKey2 = new MessageKey('✅')

    expect(messageKey1.equalsTo(messageKey1)).toBe(true)
    expect(messageKey1.equalsTo(messageKey2)).toBe(false)
  })
})
