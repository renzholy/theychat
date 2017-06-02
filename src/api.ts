const debug = require('debug')('api')
import * as EventEmitter from 'events'
import { chunk, filter, values } from 'lodash'
import * as Configstore from 'configstore'

import { WXAPI, WXAuth } from './wxapi'
import { qrcode } from '../src/utils'
import { Contact, ContactFactroy } from './models/Contact'
import { Message, MessageFactory } from './models/Message'

export class API extends EventEmitter {
  public static EVENT_CONTACTS = 'EVENT_CONTACTS'
  public static EVENT_MESSAGE = 'EVENT_MESSAGE'
  public static EVENT_ERROR = 'EVENT_ERROR'
  private conf
  private wxapi: WXAPI
  private contacts: {
    [key: string]: Contact
  } = {}

  constructor() {
    super()
    this.conf = new Configstore('theychat', null, {
      globalConfigPath: true,
    })
    this.init().catch(err => {
      this.emit(API.EVENT_ERROR, err)
    })
  }

  private async init() {
    // login
    const auth = await this.login()
    this.conf.set('auth', auth.toJSON())
    this.wxapi = new WXAPI(auth)

    // init
    const u = (await this.wxapi.webwxinit()).User
    const c = ContactFactroy.create(u)
    this.contacts[c.id] = c
    await this.wxapi.webwxstatusnotify()

    // get contacts  
    for (let contact of (await this.wxapi.webwxgetcontact()).MemberList) {
      const c = ContactFactroy.create(contact)
      this.contacts[c.id] = c
    }
    const groups = filter(this.contacts, (contact: Contact) => ContactFactroy.isGroupContact(contact))
    await this.batchGetContacts(groups.map(contact => contact.id))
    const { AddMsgList } = await this.wxapi.webwxsync()
    if (AddMsgList[0] && AddMsgList[0].MsgType === 51) {
      await this.batchGetContacts(AddMsgList[0].StatusNotifyUserName.split(','))
    } else {
      console.warn('init contacts error')
    }
    this.emit(API.EVENT_CONTACTS, this.contacts)

    while (true) {
      const { retcode, selector } = await this.wxapi.synccheck()
      debug(retcode, selector)
      if (retcode === 0 && selector !== 0) {
        const { AddMsgList } = await this.wxapi.webwxsync()
        for (let msg of AddMsgList) {
          debug(msg)
          const c = this.contacts[msg.FromUserName]
          this.emit(API.EVENT_MESSAGE, MessageFactory.create(msg))
        }
      }
      if (retcode === 1101) {
        console.error('init required')
        break
      }
    }
  }

  private async login(method: 'AUTO' | 'PUSH' | 'SCAN' = 'AUTO'): Promise<WXAuth> {
    debug(method)
    switch (method) {
      case 'AUTO': {
        if (!this.conf.has('auth.cookies')) {
          return await this.login('SCAN')
        }
        if (Date.now() / 1000 - parseInt(this.conf.get('auth.cookies.wxloadtime')) < 600) {
          return await new WXAuth(this.conf.get('auth'))
        } else {
          return await this.login('PUSH')
        }
      }
      case 'PUSH': {
        const uuid = await WXAuth.uuid(this.conf.get('auth.cookies'))
        if (uuid) {
          return await WXAuth.login(uuid)
        } else {
          return await this.login('SCAN')
        }
      }
      case 'SCAN': {
        const uuid = await WXAuth.uuid()
        if (uuid) {
          console.log(`https://login.weixin.qq.com/qrcode/${uuid}`)
          console.log(await qrcode(`https://login.weixin.qq.com/l/${uuid}`, true))
          return await WXAuth.login(uuid)
        }
        throw new Error('can\'t login')
      }
    }
  }

  private async batchGetContacts(userNames: string[]): Promise<void> {
    for (let userNames50 of chunk(userNames, 50)) {
      for (let contact of (await this.wxapi.webwxbatchgetcontact(userNames50)).ContactList) {
        const c = ContactFactroy.create(contact)
        this.contacts[c.id] = c
        for (let member of contact.MemberList || []) {
          const c = ContactFactroy.create(member)
          this.contacts[c.id] = c
        }
      }
    }
  }
}
