import * as fs from 'fs'

export interface TestConfig {
  git: GitConfig
  gpg_signing_key: GpgSigningKeyConfig
}

export interface GitConfig {
  user: GitUserConfig
}

export interface GitUserConfig {
  name: string
  email: string
  signingkey: string
}

export interface GpgSigningKeyConfig {
  private_key: string
  fingerprint: string
  keygrip: string
  passphrase: string
}

export function testConfiguration(): TestConfig {
  const gpgPrivateKeyBody = fs.readFileSync(
    `${__dirname}/../../__tests__/fixtures/test-key-committer.pgp`,
    {
      encoding: 'utf8',
      flag: 'r'
    }
  )

  // secretlint-disable
  const gpgPrivateKey = `-----BEGIN PGP PRIVATE KEY BLOCK-----\n\n${gpgPrivateKeyBody}\n-----END PGP PRIVATE KEY BLOCK-----`
  // secretlint-enable

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
