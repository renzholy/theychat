import { reduce, map } from 'lodash'
import { defaults, FullResponse } from 'request-promise-native'

import { qrcode } from './utils'

const request = defaults({
  pool: false,
  gzip: true,
  timeout: 40 * 1000,
})

export class WXAPI {
  private auth: WXAuth

  constructor(auth) {
    this.auth = auth
  }

  async webwxinit() {
  }

  async webwxstatusnotify() {
  }

  async webwxgetcontact() {
  }

  async webwxbatchgetcontact() {
  }

  async synccheck() {
  }

  async webwxsync() {
  }

  async webwxsendmsg() {
  }

  async webwxrevokemsg() {
  }

  async webwxsendmsgemotion() {
  }

  async webwxgeticon() {
  }

  async webwxgetheadimg() {
  }

  async webwxgetmsgimg() {
  }

  async webwxgetvideo() {
  }

  async webwxgetvoice() {
  }
}

export class WXAuth {
  version: string
  uin: number
  skey: string
  sid: string
  deviceId: string
  cookies: {
    [key: string]: string
  }

  constructor({
    version,
    uin,
    skey,
    sid,
    deviceId,
    cookies,
   }) {
    this.version = version
    this.uin = uin
    this.skey = skey
    this.sid = sid
    this.deviceId = deviceId
    this.cookies = cookies
  }

  public static async login(uin?: number, cookies?: {
    [key: string]: string
  }): Promise<WXAuth> {
    let redirectUri
    let version
    if (uin && cookies) {
      const { uuid, ret } = await WXAuth.pushLogin(uin, cookies)
      if (ret === '0') {
        const scan = await WXAuth.waitForScan(uuid)
        redirectUri = scan.redirectUri
        version = scan.version
      }
    } else {
      const { uuid, code } = await WXAuth.jsLogin()
      if (code === 200) {
        console.log(await qrcode(`https://login.weixin.qq.com/l/${uuid}`, true))
        const scan = await WXAuth.waitForScan(uuid)
        redirectUri = scan.redirectUri
        version = scan.version
      }
    }
    if (!redirectUri) {
      throw new Error('Login failed, no redirect URI')
    }
    return new WXAuth({
      ...await WXAuth.newLogin(redirectUri),
      deviceId: 'e' + Math.random().toFixed(15).substring(2),
      version,
    })
  }

  private static async jsLogin(): Promise<{
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

  private static async pushLogin(uin: number, cookies: {
    [key: string]: string
  }): Promise<{
    msg: string,
    uuid: string,
    ret: string,
  }> {
    return await request({
      method: 'GET',
      url: `https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxpushloginurl`,
      qs: {
        uin,
      },
      headers: {
        Cookie: map(cookies, (value, key) => `${key}=${value}`).join(';'),
      },
      json: true,
    })
  }

  private static async waitForScan(uuid: string): Promise<{
    redirectUri: string
    version: string
  }> {
    let code = 0
    while (true) {
      const html = await request({
        url: 'https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login',
        qs: {
          loginicon: true,
          uuid,
          tip: code === 201 ? 0 : 1,
          r: ~Date.now(),
          _: Date.now(),
        },
      })
      code = parseInt(html.match(/window.code ?= ?(\d+)/)[1])
      if (code === 200) {
        const redirectUri = html.match(/redirect_uri ?= ?"(.+)"/)[1]
        return {
          redirectUri,
          version: redirectUri.match(/wx(2)?\.qq\.com/)[1] || ''
        }
      }
    }
  }

  private static async newLogin(redirectUri: string): Promise<{
    uin: number
    skey: string
    sid: string
    cookies: {
      [key: string]: string
    }
  }> {
    const response: FullResponse = await request({
      url: redirectUri,
      headers: {
        Host: `wx.qq.com`,
      },
      followRedirect: false,
      simple: false,
      resolveWithFullResponse: true,
    })
    const html = response.body
    return {
      cookies: reduce(response.headers['set-cookie'], (cookies, cookie: string) => {
        const str = cookie.split(';')[0]
        const index = str.indexOf('=')
        const key = str.substr(0, index)
        const value = str.substr(index + 1)
        cookies[key] = value
        return cookies
      }, {}),
      uin: parseInt(html.match(/<wxuin>(.+)<\/wxuin>/)[1]),
      skey: html.match(/<skey>(.+)<\/skey>/)[1],
      sid: html.match(/<wxsid>(.+)<\/wxsid>/)[1],
    }
  }

  public baseRequestBody(): {
    Uin: number
    Skey: string
    Sid: string
    DeviceId: string
  } {
    return {
      Uin: this.uin,
      Skey: this.skey,
      Sid: this.sid,
      DeviceId: this.deviceId,
    }
  }

  public baseRequestQuery(): {
    uin: number
    skey: string
    sid: string
    deviceid: string
  } {
    return {
      uin: this.uin,
      skey: this.skey,
      sid: this.sid,
      deviceid: this.deviceId,
    }
  }
}
