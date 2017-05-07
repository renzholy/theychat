import { generate } from 'qrcode-terminal'

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
  return str.replace(/<\/?[^>]+>/g, '')
}

export function timestamp(): string {
  return (Date.now() * 1000 + Math.random() * 1000).toString()
}
