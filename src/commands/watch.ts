import {
  webwxsync,
  synccheck,
} from '../api'

export const command = 'watch'

export const describe = 'watch for message'

export const builder = {}

export async function handler(argv) {
  while (true) {
    const check = await synccheck()
    console.log('check', check)
    if (check.selector !== 0) {
      const sync = await webwxsync()
      console.log(sync)
    }
  }
}
