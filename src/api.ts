import { chunk, filter, values } from 'lodash'
import * as Configstore from 'configstore'
import * as LRU from 'lru-cache'

import { WXAPI, WXAuth } from './wxapi'
import { qrcode } from '../src/utils'
import { Contact, ContactFactroy } from './models/Contact'
import { Message, MessageFactory } from './models/Message'

export class API {
  private conf
  private wxapi: WXAPI
  private contacts: {
    [key: string]: Contact
  } = {}
  private recent = LRU<Contact>(20)

  constructor(name: string) {
    this.conf = new Configstore(name, null, {
      globalConfigPath: true,
    })
  }

  public async init(force: boolean) {
    if (this.conf.has('auth') && !force) {
      this.wxapi = new WXAPI(new WXAuth(this.conf.get('auth')))
    } else {
      const { uuid, scan } = await WXAuth.uuid(this.conf.get('auth.cookies'))
      if (scan) {
        console.log(`https://login.weixin.qq.com/qrcode/${uuid}`)
        console.log(await qrcode(`https://login.weixin.qq.com/l/${uuid}`, true))
      } else {
        console.log('push login')
      }
      const auth = await WXAuth.login(uuid)
      this.conf.set('auth', auth.toJSON())
      this.wxapi = new WXAPI(auth)
    }
  }

  private async batchGetContacts(userNames: string[]) {
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

  public async onIncomingMessage(callback: (msg: Message) => void) {
    await this.wxapi.webwxinit()
    await this.wxapi.webwxstatusnotify()
    for (let contact of (await this.wxapi.webwxgetcontact()).MemberList) {
      const c = ContactFactroy.create(contact)
      this.contacts[c.id] = c
    }
    const groups = filter(this.contacts, contact => ContactFactroy.isGroupContact(contact))
    await this.batchGetContacts(groups.map(contact => contact.id))
    while (true) {
      const { retcode, selector } = await this.wxapi.synccheck()
      console.debug(retcode, selector)
      if (retcode === 0 && selector !== 0) {
        const { AddMsgList } = await this.wxapi.webwxsync()
        for (let msg of AddMsgList) {
          if (msg.MsgType === 51) {
            await this.batchGetContacts(msg.StatusNotifyUserName.split(','))
          } else {
            console.debug(msg)
            const c = this.contacts[msg.FromUserName]
            this.recent.set(c.id, c)
            this.recent.get(c.id)
            await callback(MessageFactory.create(msg, this.contacts))
          }
        }
      }
      if (retcode === 1101) {
        console.error('login required')
        break
      }
    }
  }

  list(keyword?: string): Contact[] {
    if (keyword) {
      return filter(this.contacts, contact => {
        return contact.match(keyword)
      })
    }
    return this.recent.values()
  }
}
