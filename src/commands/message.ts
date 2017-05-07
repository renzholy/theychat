import {
  webwxsendmsg,
} from '../api'

export const command = 'message [to] [content]'

export const describe = 'send message'

export const builder = {}

export async function handler(argv) {
  process.exit((await webwxsendmsg(argv.to, argv.content)).BaseResponse.Ret)
}
