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
} from './model'
import { sleep } from './utils'

const rq = request.defaults({
  pool: false,
  jar: request.jar(),
  gzip: true,
})

const host = 'wx.qq.com'

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
  wxuin: number,
  skey: string,
  wxsid: string,
  pass_ticket: string,
}> {
  const html = await rq({
    url: redirect_uri,
    headers: {
      Host: host,
    },
    followRedirect: false,
    simple: false,
  })
  return {
    wxuin: parseInt(html.match(/<wxuin>(.+)<\/wxuin>/)[1]),
    skey: html.match(/<skey>(.+)<\/skey>/)[1],
    wxsid: html.match(/<wxsid>(.+)<\/wxsid>/)[1],
    pass_ticket: html.match(/<pass_ticket>(.+)<\/pass_ticket>/)[1],
  }
}

export async function webwxinit(base_request: BaseRequest): Promise<{
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
  while (true) {
    try {
      const json = await rq({
        method: 'POST',
        url: `https://${host}/cgi-bin/mmwebwx-bin/webwxinit`,
        qs: {
          r: ~Date.now(),
        },
        json: {
          BaseRequest: base_request,
        },
      })
      return json
    } catch (err) {
      await sleep(5000)
    }
  }
}

export async function webwxsync(base_request: BaseRequest, sync_key: SyncKey): Promise<{
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
  while (true) {
    try {
      const json = await rq({
        method: 'POST',
        url: `https://${host}/cgi-bin/mmwebwx-bin/webwxsync`,
        qs: {
          sid: base_request.Sid,
          skey: base_request.Skey,
        },
        json: {
          BaseRequest: base_request,
          SyncKey: sync_key,
          rr: ~Date.now(),
        },
      })
      return json
    } catch (err) {
      await sleep(5000)
    }
  }
}

export async function webwxgetcontact(base_request: BaseRequest): Promise<{
  BaseResponse: BaseResponse,
  MemberCount: number,
  MemberList: Contact[],
  Seq: number,
}> {
  const json = await rq({
    method: 'POST',
    url: `https://${host}/cgi-bin/mmwebwx-bin/webwxgetcontact`,
    json: {
      BaseRequest: base_request,
    },
  })
  return json
}

export async function webwxsendmsg(base_request: BaseRequest, from: string, to: string, content: string): Promise<{
  BaseResponse: BaseResponse,
  MsgId: string,
  LocalID: string,
}> {
  const Id = Date.now() * 1000 + Math.random() * 1000
  const json = await rq({
    method: 'POST',
    url: `https://${host}/cgi-bin/mmwebwx-bin/webwxsendmsg`,
    json: {
      BaseRequest: base_request,
      Msg: {
        ClientMsgId: Id,
        Content: content,
        FromUserName: from,
        LocalID: Id,
        ToUserName: to,
        Type: 1,
      },
      Scene: 0,
    },
  })
  return json
}
