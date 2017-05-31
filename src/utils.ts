import { generate } from 'qrcode-terminal'
import { ucs2 } from 'punycode'
import { chunk } from 'lodash'
import * as emojis from 'emojis-list'

export async function qrcode(str: string, small: boolean = false): Promise<string> {
  return new Promise<string>((resolve) => {
    generate(str, { small }, (code) => {
      resolve(small ? code.trim() : code)
    })
  })
}

const LRO = new RegExp(String.fromCharCode(parseInt('0x202D', 16)), 'g') // Left-to-Right Override
const RLO = new RegExp(String.fromCharCode(parseInt('0x202E', 16)), 'g') // Right-to-Left Override
const EOF = new RegExp(String.fromCharCode(parseInt('0xFE0F', 16)), 'g')

export function replaceEmoji(str: string): string {
  let text = str.replace(/<\/?[^>]+>/g, (a) => {
    const matched = a.match(/emoji(\w+)/)
    if (matched) {
      try {
        return ucs2.encode(chunk(matched[1].split(''), 5).map(c => parseInt(c.join(''), 16)))
      } catch (err) {
        return ''
      }
    }
    return ''
  })
  emojis.forEach(emoji => {
    if (text.indexOf(emoji) >= 0) {
      text = text.replace(new RegExp(emoji, 'g'), e => e + ' ')
      return
    }
  })
  return text.replace(LRO, '').replace(RLO, '').replace(EOF, '')
}

export function sleep(milliseconds: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}
