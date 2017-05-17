import { defaults } from 'request-promise-native'

const request = defaults({
  pool: false,
  gzip: true,
  timeout: 40 * 1000,
})

export async function jslogin(): Promise<{
  code: number
  uuid?: string
}> {
  const html = await request({
    method: 'POST',
    url: 'https://login.weixin.qq.com/jslogin',
    qs: {
      appid: 'wx782c26e4c19acffb',
      fun: 'new',
      lang: 'zh_CN',
      _: Date.now(),
    },
  })
  const code = parseInt(html.match(/QRLogin.code ?= ?(\d+)/)[1])
  return {
    code,
    uuid: code === 200 && html.match(/QRLogin.uuid ?= ?"(.+)"/)[1],
  }
}

export async function webwxpushloginurl() {

}

export async function login() {

}

export async function webwxnewloginpage() {

}

export async function webwxinit() {

}

export async function webwxstatusnotify() {

}

export async function webwxgetcontact() {

}

export async function webwxbatchgetcontact() {

}

export async function synccheck() {

}

export async function webwxsync() {

}

export async function webwxsendmsg() {

}

export async function webwxrevokemsg() {

}

export async function webwxsendmsgemotion() {

}

export async function webwxgeticon() {

}

export async function webwxgetheadimg() {

}

export async function webwxgetmsgimg() {

}

export async function webwxgetvideo() {

}

export async function webwxgetvoice() {

}
