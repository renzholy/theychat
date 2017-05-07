import { generate } from 'qrcode-terminal'
import { ucs2 } from 'punycode'

export async function sleep(milliseconds: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    setTimeout(resolve, milliseconds)
  })
}

export async function qrcode(str: string, small: boolean = false): Promise<string> {
  return new Promise<string>((resolve) => {
    generate(str, { small }, (code) => {
      resolve(small ? code.trim() : code)
    })
  })
}

export function formatText(str: string): string {
  return str.replace(/<\/?[^>]+>/g, (a) => {
    if (/emoji emoji(\w+)/.test(a)) {
      try {
        return ucs2.encode([parseInt(a.match(/emoji(\w+)/)[1], 16)]) + ' '
      } catch (err) {
        return ''
      }
    }
    return ''
  })
}
