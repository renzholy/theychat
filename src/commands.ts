import { init } from './api'
export default async function (args: string[]) {
  switch (args[0]) {
    case 'login': {
      await init()
      break
    }
    default: {
      break
    }
  }
  process.exit(0)
}
