import * as request from 'request-promise-native'
import {
  BaseResponse,
  Contact,
  SyncKey,
  User,
  MPSubscribeMsg,
} from './model'
import { sleep } from './utils'

const rq = request.defaults({
  pool: false,
  jar: request.jar(),
  gzip: true,
})

export async function jslogin(): Promise<{
  code: number,
  uuid: string,
}> {
  const html = await rq({
    url: 'https://login.web.wechat.com/jslogin',
    qs: {
      appid: 'wx782c26e4c19acffb',
      redirect_uri: 'https://web.wechat.com/cgi-bin/mmwebwx-bin/webwxnewloginpage',
      fun: 'new',
      lang: 'zh_CN',
      _: Date.now(),
    }
  })
  return {
    code: parseInt(html.match(/QRLogin.code ?= ?(\d+)/)[1]),
    uuid: html.match(/QRLogin.uuid ?= ?"(.+)"/)[1],
  }
}

export async function login(uuid: string): Promise<{
  redirect_uri: string,
}> {
  let code = 0
  while (true) {
    const html = await rq({
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
      return {
        redirect_uri: html.match(/redirect_uri="(.+)"/)[1],
      }
    }
  }
}

export async function webwxnewloginpage(redirect_uri: string): Promise<{
  wxuin: string,
  skey: string,
  wxsid: string,
  pass_ticket: string,
}> {
  const html = await rq({
    url: redirect_uri,
    headers: {
      Host: 'wx.qq.com',
    },
    followRedirect: false,
    simple: false,
  })
  return {
    wxuin: html.match(/<wxuin>(.+)<\/wxuin>/)[1],
    skey: html.match(/<skey>(.+)<\/skey>/)[1],
    wxsid: html.match(/<wxsid>(.+)<\/wxsid>/)[1],
    pass_ticket: html.match(/<pass_ticket>(.+)<\/pass_ticket>/)[1],
  }
}

export async function webwxinit(DeviceID: string, Sid: string, Uin: string): Promise<{
  BaseResponse: BaseResponse,
  Count: number,
  ContactList: Contact,
  SyncKey: SyncKey,
  User: User,
  ChatSet: string,
  Skey: string,
  ClientVersion: number,
  SystemTime: number,
  GrayScale: number,
  InviteStartCount: number,
  MPSubscribeMsgCount: number,
  MPSubscribeMsgList: MPSubscribeMsg,
  ClickReportInterval: number,
}> {
  while (true) {
    try {
      const json = await rq({
        method: 'POST',
        url: 'https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxinit',
        headers: {
          Accept: 'application/json, text/plain, */*',
          Origin: 'https://wx.qq.com',
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36',
          'Content-Type': 'application/json;charset=UTF-8',
          Referer: 'https://wx.qq.com/',
          'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.6,en;q=0.4,ja;q=0.2',
        },
        qs: {
          r: ~Date.now(),
        },
        json: {
          BaseRequest: {
            DeviceID,
            Sid,
            Skey: '',
            Uin,
          },
        },
      })
      return json
    } catch (err) {
      console.warn('webwxinit retry')
      await sleep(3000)
    }
  }
}
