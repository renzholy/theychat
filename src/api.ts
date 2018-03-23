const debug = require('debug')('api')
import * as EventEmitter from 'events'
import * as Configstore from 'configstore'
import { chunk, values } from 'lodash'

import { WXAPI, WXAuth } from './wxapi'
import { qrcode } from '../src/utils'
import { ContactStore } from './models/contact-store'
import { Contact, ContactFactroy } from './models/contact'
import { Message, MessageFactory } from './models/message'

export class API {
  private static EVENT_LOGIN = 'EVENT_LOGIN'
  private static EVENT_CONTACTS = 'EVENT_CONTACTS'
  private static EVENT_MESSAGE = 'EVENT_MESSAGE'
  private static EVENT_ERROR = 'EVENT_ERROR'
  private emitter = new EventEmitter()
  private conf = new Configstore('theychat', null, {
    globalConfigPath: true,
  })
  private contactStore = new ContactStore()
  private wxapi: WXAPI

  constructor() {
    this.init().catch(err => {
      this.emitter.emit(API.EVENT_ERROR, err)
    })
  }

  private async init(relogin: boolean = false): Promise<void> {
    // login
    const auth = await this.login(relogin ? 'SCAN' : 'AUTO')
    this.conf.set('auth', auth.toJSON())
    this.wxapi = new WXAPI(auth)

    // init
    const u = (await this.wxapi.webwxinit()).User
    const c = ContactFactroy.create(u)
    this.contactStore.add(c)
    await this.wxapi.webwxstatusnotify()
    this.emitter.emit(API.EVENT_LOGIN, c)

    // get contacts  
    for (let contact of (await this.wxapi.webwxgetcontact()).MemberList) {
      const c = ContactFactroy.create(contact)
      this.contactStore.add(c)
    }
    const groups = this.contactStore.filter(ContactFactroy.isGroupContact)
    await this.batchGetContacts(groups.map(contact => contact.id))
    const { AddMsgList } = await this.wxapi.webwxsync()
    if (AddMsgList[0] && AddMsgList[0].MsgType === 51) {
      await this.batchGetContacts(AddMsgList[0].StatusNotifyUserName.split(','))
    } else {
      this.emitter.emit(API.EVENT_ERROR, new Error('init contacts error'))
    }
    this.emitter.emit(API.EVENT_CONTACTS, this.contactStore)

    while (true) {
      const { retcode, selector } = await this.wxapi.synccheck()
      debug(retcode, selector)
      if (retcode === 0 && selector !== 0) {
        const { AddMsgList } = await this.wxapi.webwxsync()
        for (let msg of AddMsgList) {
          debug(msg)
          const message = MessageFactory.create(msg)
          this.emitter.emit(API.EVENT_MESSAGE, message)
        }
      }
      if (retcode === 1101) {
        this.emitter.emit(API.EVENT_ERROR, new Error('login required'))
        break
      }
    }
    return this.init(true)
  }

  private async login(method: 'AUTO' | 'PUSH' | 'SCAN'): Promise<WXAuth> {
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
        this.contactStore.add(c)
        for (let member of contact.MemberList || []) {
          const c = ContactFactroy.create(member)
          this.contactStore.add(c)
        }
      }
    }
  }

  public onLogin(callback: (user: Contact) => void): void {
    this.emitter.on(API.EVENT_LOGIN, callback)
  }

  public onContacts(callback: (contactStore: ContactStore) => void): void {
    this.emitter.on(API.EVENT_CONTACTS, callback)
  }

  public onMessage(callback: (message: Message) => void): void {
    this.emitter.on(API.EVENT_MESSAGE, callback)
  }

  public onError(callback: (err: Error) => void): void {
    this.emitter.on(API.EVENT_ERROR, callback)
  }
}
