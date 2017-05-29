import { init, watch, getCommunicator } from './api'
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
          const from = getCommunicator(msg.from)
          notify({
            title: from.name,
            message: msg.content,
          })
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
