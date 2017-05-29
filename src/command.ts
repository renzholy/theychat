import { init, watch, communicators } from './api'
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
          const speaker = msg.content.match(/^(@\w+):<br\/>/)
          notify({
            title: `${communicators.get(msg.from).name} -> ${communicators.get(msg.to).name}`,
            message: speaker ? msg.content.replace(/@\w+/, communicators.get(speaker[1]).name) : msg.content,
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
