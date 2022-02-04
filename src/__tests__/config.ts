import * as fs from 'fs'

export function testConfiguration() {
  const gpgPrivateKey = fs.readFileSync(
    '__tests__/fixtures/test-key-committer.pgp',
    {
      encoding: 'utf8',
      flag: 'r'
    }
  )

  const signingKeyFingerprint = 'BD98B3F42545FF93EFF55F7F3F39AA1432CA6AD7'

  return {
    git: {
      user: {
        name: 'A committer',
        email: 'committer@example.com',
        signingkey: signingKeyFingerprint
      }
    },
    gpg_signing_key: {
      private_key: gpgPrivateKey,
      fingerprint: signingKeyFingerprint,
      keygrip: '00CB9308AE0B6DE018C5ADBAB29BA7899D6062BE', // Keygrip of 'git.user.signingkey'
      passphrase: '123456'
    }
  }
}
