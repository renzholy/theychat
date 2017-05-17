import {
  set,
  map,
  mapKeys,
} from 'lodash'
import * as request from 'request-promise-native'
import {
  BaseRequest,
  BaseResponse,
  Contact,
  SyncKey,
  User,
  MPSubscribeMsg,
  AddMsg,
  DelContact,
  ModChatRoomMember,
  ModContact,
  Profile,
} from './type'
import {
  sleep,
  timestamp,
} from './utils'
import {
  getDeviceID,
  getBaseRequest,
  setBaseRequest,
  getCookies,
  setCookies,
  getSyncKey,
  setSyncKey,
  getUser,
  setUser,
} from './store'

const defaultRequest = request.defaults({
  pool: false,
  gzip: true,
  timeout: 30 * 1000,
})

async function rq(options: request.Options): Promise<any> {
  const cookies = await getCookies()
  set(options, 'headers.Cookie', map(cookies, (value, key) => `${key}=${value}`).join(';'))
  return await defaultRequest(options)
}

let version = ''

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
    },
  })
  return {
    code: parseInt(html.match(/QRLogin.code ?= ?(\d+)/)[1]),
    uuid: html.match(/QRLogin.uuid ?= ?"(.+)"/)[1],
  }
}

export async function login(uuid: string): Promise<string> {
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
      const redirect_uri = html.match(/redirect_uri ?= ?"(.+)"/)[1]
      version = redirect_uri.match(/wx(2)?\.qq\.com/)[1] || ''
      return redirect_uri
    }
  }
}

export async function webwxnewloginpage(redirect_uri: string): Promise<void> {
  const response: request.FullResponse = await rq({
    url: redirect_uri,
    headers: {
      Host: `wx${version}.qq.com`,
    },
    followRedirect: false,
    simple: false,
    resolveWithFullResponse: true,
  })
  const html = response.body
  await setCookies(response.headers['set-cookie'])
  await setBaseRequest({
    Uin: parseInt(html.match(/<wxuin>(.+)<\/wxuin>/)[1]),
    Skey: html.match(/<skey>(.+)<\/skey>/)[1],
    Sid: html.match(/<wxsid>(.+)<\/wxsid>/)[1],
    DeviceID: await getDeviceID(),
  })
}

export async function webwxpushloginurl(): Promise<{
  msg: string,
  uuid: string,
  ret: string,
}> {
  const json = await rq({
    method: 'GET',
    url: `https://wx${version}.qq.com/cgi-bin/mmwebwx-bin/webwxpushloginurl`,
    qs: {
      uin: (await getUser()).Uin,
    },
    json: true,
  })
  return json
}

export async function webwxinit(): Promise<{
  BaseResponse: BaseResponse,
  Count: number,
  ContactList: Contact[],
  SyncKey: SyncKey,
  User: User,
  ChatSet: string,
  Skey: string,
  ClientVersion: number,
  SystemTime: number,
  GrayScale: number,
  InviteStartCount: number,
  MPSubscribeMsgCount: number,
  MPSubscribeMsgList: MPSubscribeMsg[],
  ClickReportInterval: number,
}> {
  const json = await rq({
    method: 'POST',
    url: `https://wx${version}.qq.com/cgi-bin/mmwebwx-bin/webwxinit`,
    qs: {
      r: ~Date.now(),
    },
    json: {
      BaseRequest: await getBaseRequest(),
    },
  })
  await setSyncKey(json.SyncKey)
  await setUser(json.User)
  return json
}

export async function webwxstatusnotify(): Promise<{
  BaseResponse: BaseResponse,
  MsgID: string,
}> {
  const json = await rq({
    method: 'POST',
    url: `https://wx${version}.qq.com/cgi-bin/mmwebwx-bin/webwxstatusnotify`,
    json: {
      BaseRequest: await getBaseRequest(),
      Code: 3,
      FromUserName: (await getUser()).UserName,
      ToUserName: (await getUser()).UserName,
      ClientMsgId: Date.now(),
    },
  })
  return json
}

export async function synccheck(): Promise<{
  retcode: number,
  selector: number,
}> {
  const html = await rq({
    method: 'GET',
    url: `https://webpush.wx${version}.qq.com/cgi-bin/mmwebwx-bin/synccheck`,
    qs: {
      ...mapKeys(await getBaseRequest(), (value, key) => key.toLowerCase()),
      synckey: (await getSyncKey()).List.map(item => `${item.Key}_${item.Val}`).join('|'),
      r: Date.now(),
      _: Date.now(),
    },
  })
  return {
    retcode: parseInt(html.match(/retcode ?: ?"(.+)"/)[1]),
    selector: parseInt(html.match(/selector ?: ?"(.+)"/)[1]),
  }
}

export async function webwxsync(): Promise<{
  BaseResponse: BaseResponse,
  AddMsgCount: number,
  AddMsgList: AddMsg[],
  ModContactCount: number,
  ModContactList: ModContact[],
  DelContactCount: number,
  DelContactList: DelContact[],
  ModChatRoomMemberCount: number,
  ModChatRoomMemberList: ModChatRoomMember[],
  Profile: Profile,
  ContinueFlag: number,
  SyncKey: SyncKey,
  SKey: string,
  SyncCheckKey: SyncKey,
}> {
  const response: request.FullResponse = await rq({
    method: 'POST',
    url: `https://wx${version}.qq.com/cgi-bin/mmwebwx-bin/webwxsync`,
    qs: mapKeys(await getBaseRequest(), (value, key) => key.toLowerCase()),
    json: {
      BaseRequest: await getBaseRequest(),
      SyncKey: await getSyncKey(),
      rr: ~Date.now(),
    },
    resolveWithFullResponse: true,
  })
  await setCookies(response.headers['set-cookie'])
  await setSyncKey(response.body.SyncKey)
  return response.body
}

export async function webwxgetcontact(): Promise<{
  BaseResponse: BaseResponse,
  MemberCount: number,
  MemberList: Contact[],
  Seq: number,
}> {
  const json = await rq({
    method: 'POST',
    url: `https://wx${version}.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact`,
    json: {
      BaseRequest: await getBaseRequest(),
    },
  })
  return json
}

export async function webwxsendmsg(to: string, content: string): Promise<{
  BaseResponse: BaseResponse,
  MsgId: string,
  LocalID: string,
}> {
  const ts = timestamp()
  const json = await rq({
    method: 'POST',
    url: `https://wx${version}.qq.com/cgi-bin/mmwebwx-bin/webwxsendmsg`,
    json: {
      BaseRequest: await getBaseRequest(),
      Msg: {
        ClientMsgId: ts,
        Content: content,
        FromUserName: (await getUser()).UserName,
        LocalID: ts,
        ToUserName: to,
        Type: 1,
      },
      Scene: 0,
    },
  })
  return json
}
