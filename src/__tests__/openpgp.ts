import * as openpgp from 'openpgp'
import {EmailAddress} from '../email-address'

export interface PrivateKey {
  fingerprint: string
  keyID: string
  name: string
  email: string
  creationTime: Date
}

export interface KeyPair {
  publicKey: string
  privateKey: string
}

export interface Address {
  name: string
  address: string
}

export const readPrivateKey = async (key: string): Promise<PrivateKey> => {
  const privateKey = await openpgp.readKey({
    armoredKey: (await isArmored(key))
      ? key
      : Buffer.from(key, 'base64').toString()
  })

  const primaryUser = await privateKey.getPrimaryUser()
  const address = addressParser(primaryUser.user.userID?.userID)

  return {
    fingerprint: privateKey.getFingerprint().toUpperCase(),
    keyID: privateKey.getKeyID().toHex().toUpperCase(),
    name: address.name,
    email: address.address,
    creationTime: privateKey.getCreationTime()
  }
}

export const generateKeyPair = async (
  name: string,
  email: string,
  passphrase: string,
  type?: 'ecc' | 'rsa'
): Promise<KeyPair> => {
  const keyPair = await openpgp.generateKey({
    userIDs: [{name, email}],
    passphrase,
    type
  })

  return {
    publicKey: keyPair.publicKey.replace(/\r\n/g, '\n').trim(),
    privateKey: keyPair.privateKey.replace(/\r\n/g, '\n').trim()
  }
}

export const isArmored = async (text: string): Promise<boolean> => {
  return text.trimStart().startsWith('---')
}

function addressParser(address: string | undefined): Address {
  if (address === undefined) {
    return {
      name: '',
      address: ''
    }
  }

  const emailAddress = new EmailAddress(address)
  return {
    name: emailAddress.getDisplayName(),
    address: emailAddress.getEmail()
  }
}
