import { reduce, map, set } from 'lodash'
import { defaults, FullResponse, Options } from 'request-promise-native'

import { BaseRequest, BaseResponse, Contact, SyncKey, User, MPSubscribeMsg, AddMsg, DelContact, ModChatRoomMember, ModContact, Profile } from './type'

const request = defaults({
  pool: false,
  gzip: true,
  timeout: 40 * 1000,
})

export class WXAPI {
  private auth: WXAuth
  private user: User
  private syncKey: SyncKey

  constructor(auth) {
    this.auth = auth
  }

  private async request(options: Options) {
    set(options, 'headers.Cookie', map(this.auth.cookies, (value, key) => `${key}=${value}`).join(';'))
    return await request(options)
  }

  public async webwxinit(): Promise<{
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
    const json = await this.request({
      method: 'POST',
      url: `https://wx${this.auth.version}.qq.com/cgi-bin/mmwebwx-bin/webwxinit`,
      qs: {
        r: ~Date.now(),
      },
      json: {
        BaseRequest: this.auth.baseRequestBody(),
      },
    })
    this.user = json.User
    this.syncKey = json.SyncKey
    return json
  }

  public async webwxstatusnotify(): Promise<{
    BaseResponse: BaseResponse,
    MsgID: string,
  }> {
    const json = await this.request({
      method: 'POST',
      url: `https://wx${this.auth.version}.qq.com/cgi-bin/mmwebwx-bin/webwxstatusnotify`,
      json: {
        BaseRequest: this.auth.baseRequestBody(),
        Code: 3,
        FromUserName: this.user.UserName,
        ToUserName: this.user.UserName,
        ClientMsgId: Date.now(),
      },
    })
    return json
  }

  public async webwxgetcontact(): Promise<{
    BaseResponse: BaseResponse,
    MemberList: Contact[],
    MemberCount: number,
    Seq: number,
  }> {
    const json = await this.request({
      method: 'POST',
      url: `https://wx${this.auth.version}.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact`,
      json: {
        BaseRequest: this.auth.baseRequestBody(),
      },
    })
    return json
  }

  public async webwxbatchgetcontact(contacts: Contact[]): Promise<{
    BaseResponse: BaseResponse,
    ContactList: Contact[],
    Count: number,
  }> {
    const json = await this.request({
      method: 'POST',
      url: `https://wx${this.auth.version}.qq.com/cgi-bin/mmwebwx-bin/webwxbatchgetcontact`,
      qs: {
        type: 'ex',
        r: Date.now(),
      },
      json: {
        BaseRequest: this.auth.baseRequestBody(),
        Count: contacts.length,
        List: map(contacts, contact => ({
          EncryChatRoomId: '',
          UserName: contact.UserName,
        })),
      },
    })
    return json
  }

  public async synccheck(): Promise<{
    retcode: number,
    selector: number,
  }> {
    const html = await this.request({
      method: 'GET',
      url: `https://webpush.wx${this.auth.version}.qq.com/cgi-bin/mmwebwx-bin/synccheck`,
      qs: {
        ...this.auth.baseRequestQuery(),
        synckey: this.syncKey.List.map(item => `${item.Key}_${item.Val}`).join('|'),
        r: Date.now(),
        _: Date.now(),
      },
    })
    return {
      retcode: parseInt(html.match(/retcode ?: ?"(.+)"/)[1]),
      selector: parseInt(html.match(/selector ?: ?"(.+)"/)[1]),
    }
  }

  public async webwxsync(): Promise<{
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
    const json = await this.request({
      method: 'POST',
      url: `https://wx${this.auth.version}.qq.com/cgi-bin/mmwebwx-bin/webwxsync`,
      qs: this.auth.baseRequestQuery(),
      json: {
        BaseRequest: this.auth.baseRequestBody(),
        SyncKey: this.syncKey,
        rr: ~Date.now(),
      },
    })
    this.syncKey = json.SyncKey
    return json
  }

  public async webwxsendmsg(target: Contact, content: string, type: number = 1): Promise<{
    BaseResponse: BaseResponse,
    MsgId: string,
    LocalID: string,
  }> {
    const msgId = ((Date.now() + Math.random()) * 1000).toString()
    const json = await this.request({
      method: 'POST',
      url: `https://wx${this.auth.version}.qq.com/cgi-bin/mmwebwx-bin/webwxsendmsg`,
      json: {
        BaseRequest: this.auth.baseRequestBody(),
        Msg: {
          ClientMsgId: msgId,
          Content: content,
          FromUserName: this.user.UserName,
          LocalID: msgId,
          ToUserName: target.UserName,
          Type: type,
        },
        Scene: 0,
      },
    })
    return json
  }

  public async webwxrevokemsg() {
  }

  public async webwxsendmsgemotion() {
  }

  public async webwxgeticon() {
  }

  public async webwxgetheadimg() {
  }

  public async webwxgetmsgimg() {
  }

  public async webwxgetvideo() {
  }

  public async webwxgetvoice() {
  }
}

export class WXAuth {
  public version: string
  public uin: number
  public skey: string
  public sid: string
  public deviceId: string
  public cookies: {
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

  public static async uuid(uin?: number, cookies?: {
    [key: string]: string
  }): Promise<string | null> {
    let redirectUri
    let version
    if (uin && cookies) {
      const { uuid, ret } = await WXAuth.pushLogin(uin, cookies)
      if (ret === '0') {
        return uuid
      }
    } else {
      const { uuid, code } = await WXAuth.jsLogin()
      if (code === 200) {
        return uuid
      }
    }
    return null
  }

  public static async login(uuid: string): Promise<WXAuth> {
    const scan = await WXAuth.waitForScan(uuid)
    const redirectUri = scan.redirectUri
    const version = scan.version
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
