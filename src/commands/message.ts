import {
  webwxsendmsg,
  synccheck,
  webwxsync,
} from '../api'

export const command = 'message [to] [content]'

export const describe = 'send message'

export const builder = {}

export async function handler(argv) {
  console.log('synccheck', await synccheck())
  console.log('webwxsync', await webwxsync())
  console.log(await webwxsendmsg(argv.to, argv.content))
  process.exit(0)
}
