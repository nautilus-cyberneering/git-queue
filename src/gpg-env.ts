import * as os from 'os'
import * as path from 'path'

export const getGnupgHome = async (): Promise<string> => {
  if (process.env.GNUPGHOME) {
    return process.env.GNUPGHOME
  }
  let homedir: string = path.join(process.env.HOME || '', '.gnupg')
  if (os.platform() === 'win32' && !process.env.HOME) {
    homedir = path.join(process.env.USERPROFILE || '', '.gnupg')
  }
  return homedir
}
