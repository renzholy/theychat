import {
  webwxsync,
  synccheck,
} from '../api'
import {
  getContact,
} from '../store'
import {
  Contact,
} from '../model'

export const command = 'watch'

export const describe = 'watch for message'

export const builder = {}

function name(contact: Contact): string {
  return contact ? contact.RemarkName || contact.NickName || contact.DisplayName || contact.UserName : 'Stranger'
}

export async function handler(argv) {
  while (true) {
    const check = await synccheck()
    console.log('check', check)
    if (check.selector !== 0) {
      const sync = await webwxsync()
      sync.AddMsgList.forEach(async (msg) => {
        console.log(msg.MsgType, msg.FromUserName, msg.ToUserName, msg.Content)
        switch (msg.MsgType) {
          case 1: {
            // text msg
            const from = await getContact(msg.FromUserName)
            const to = await getContact(msg.ToUserName)
            console.log(name(from), name(to), msg.Content)
          }
        }
      })
    }
  }
}
