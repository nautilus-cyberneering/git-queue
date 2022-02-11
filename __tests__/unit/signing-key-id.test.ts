import {SigningKeyId, emptySigningKeyId} from '../../src/signing-key-id'

describe('SigningKeyId', () => {
  it('should contain id of a GPG signing key', () => {
    const signingKeyId = new SigningKeyId('signing-key-id')

    expect(signingKeyId.toString()).toBe('signing-key-id')
  })

  it('should compare two signing key ids names', () => {
    const signingKeyId1 = new SigningKeyId('signing-key-id-1')
    const signingKeyId2 = new SigningKeyId('signing-key-id-2')

    expect(signingKeyId1.equalsTo(signingKeyId1)).toBe(true)
    expect(signingKeyId1.equalsTo(signingKeyId2)).toBe(false)
  })

  it('could be empty', () => {
    const signingKeyId = emptySigningKeyId()

    expect(signingKeyId.isEmpty()).toBe(true)
  })
})
