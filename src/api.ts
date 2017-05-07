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
import {
  getDeviceID,
  getBaseRequest,
  setBaseRequest,
  getSyncKey,
  setSyncKey,
  getUser,
  setUser,
  setContacts,
} from './store'

const rq = request.defaults({
  pool: false,
  jar: request.jar(),
  gzip: true,
})

const ApiVersion = ''
// const ApiVersion = '2'

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
      return html.match(/redirect_uri="(.+)"/)[1]
    }
  }
}

export async function webwxnewloginpage(redirect_uri: string): Promise<void> {
  const html = await rq({
    url: redirect_uri,
    headers: {
      Host: `wx${ApiVersion}.qq.com`,
    },
    followRedirect: false,
    simple: false,
  })
  const baseRequest = {
    Uin: parseInt(html.match(/<wxuin>(.+)<\/wxuin>/)[1]),
    Skey: html.match(/<skey>(.+)<\/skey>/)[1],
    Sid: html.match(/<wxsid>(.+)<\/wxsid>/)[1],
    DeviceID: await getDeviceID(),
  }
  await setBaseRequest(baseRequest)
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
    url: `https://wx${ApiVersion}.qq.com/cgi-bin/mmwebwx-bin/webwxinit`,
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

export async function synccheck(): Promise<{
  retcode: number,
  selector: number,
}> {
  const html = await rq({
    method: 'POST',
    url: `https://webpush.wx${ApiVersion}.qq.com/cgi-bin/mmwebwx-bin/synccheck`,
    qs: {
      sid: (await getBaseRequest()).Sid,
      skey: (await getBaseRequest()).Skey,
      uin: (await getBaseRequest()).Uin,
      deviceid: (await getBaseRequest()).DeviceID,
    },
    json: {
      BaseRequest: await getBaseRequest(),
    },
  })
  return {
    retcode: parseInt(html.match(/retcode:"(.+)"/)[1]),
    selector: parseInt(html.match(/selector:"(.+)"/)[1]),
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
  const json = await rq({
    method: 'POST',
    url: `https://wx${ApiVersion}.qq.com/cgi-bin/mmwebwx-bin/webwxsync`,
    qs: {
      sid: (await getBaseRequest()).Sid,
      skey: (await getBaseRequest()).Skey,
    },
    json: {
      BaseRequest: await getBaseRequest(),
      SyncKey: await getSyncKey(),
      rr: ~Date.now(),
    },
  })
  return json
}

export async function webwxgetcontact(): Promise<{
  BaseResponse: BaseResponse,
  MemberCount: number,
  MemberList: Contact[],
  Seq: number,
}> {
  const json = await rq({
    method: 'POST',
    url: `https://wx${ApiVersion}.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact`,
    json: {
      BaseRequest: await getBaseRequest(),
    },
  })
  setContacts(json.MemberList)
  return json
}

export async function webwxsendmsg(to: string, content: string): Promise<{
  BaseResponse: BaseResponse,
  MsgId: string,
  LocalID: string,
}> {
  const Id = Date.now() * 1000 + Math.random() * 1000
  const json = await rq({
    method: 'POST',
    url: `https://wx${ApiVersion}.qq.com/cgi-bin/mmwebwx-bin/webwxsendmsg`,
    json: {
      BaseRequest: await getBaseRequest(),
      Msg: {
        ClientMsgId: Id,
        Content: content,
        FromUserName: (await getUser()).UserName,
        LocalID: Id,
        ToUserName: to,
        Type: 1,
      },
      Scene: 0,
    },
  })
  return json
}
