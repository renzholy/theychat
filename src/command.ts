import { init, watch, getContact } from './api'
import { notify } from 'node-notifier'

export default async function (args: string[]) {
  try {
    switch (args[0]) {
      case 'login': {
        await init()
        break
      }
      case 'watch': {
        await watch((msg) => {
          if (msg.Content) {
            const from = getContact(msg.FromUserName)
            const to = getContact(msg.ToUserName)
            notify({
              title: `${from && (from.RemarkName || from.DisplayName || from.NickName)} -> ${to && to.RemarkName || to.DisplayName || to.NickName}`,
              message: msg.Content,
            })
          }
        })
        break
      }
      default: {
        break
      }
    }
  }
  catch (err) {
    console.error(err)
  }
}
