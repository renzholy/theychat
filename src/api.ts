import { chunk } from 'lodash'
import * as Configstore from 'configstore'
import { WXAPI, WXAuth } from './wxapi'
import { qrcode } from '../src/utils'
import { Communicator, Communicators, IncomingMessage } from './model'
const pkg = require('../../package.json')

export class API {
  private conf = new Configstore(pkg.name, null, {
    globalConfigPath: true,
  })
  private wxapi: WXAPI
  private communicators = new Communicators()

  async init(force: boolean) {
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

  async onIncomingMessage(cb: (msg: IncomingMessage, communicators: Communicators) => void) {
    await this.wxapi.webwxinit()
    await this.wxapi.webwxstatusnotify()
    for (let contact of (await this.wxapi.webwxgetcontact()).MemberList) {
      this.communicators.add(new Communicator(contact))
    }
    const groups = this.communicators.allGroups().map(communicator => communicator.id)
    for (let group of (await this.wxapi.webwxbatchgetcontact(groups)).ContactList) {
      const c = new Communicator(group)
      console.debug(c.id, c.name)
      this.communicators.add(c)
      for (let member of group.MemberList) {
        this.communicators.add(new Communicator(member))
      }
    }
    while (true) {
      const { retcode, selector } = await this.wxapi.synccheck()
      console.debug(retcode, selector)
      if (retcode === 0 && selector !== 0) {
        const { AddMsgList } = await this.wxapi.webwxsync()
        for (let msg of AddMsgList) {
          if (msg.MsgType === 51) {
            for (let ids of chunk(msg.StatusNotifyUserName.split(','), 50)) {
              for (let group of (await this.wxapi.webwxbatchgetcontact(ids)).ContactList) {
                const c = new Communicator(group)
                console.debug(c.id, c.name)
                this.communicators.add(c)
                for (let member of group.MemberList) {
                  this.communicators.add(new Communicator(member))
                }
              }
            }
          } else {
            console.debug(msg)
            await cb(new IncomingMessage(msg), this.communicators)
          }
        }
      }
      if (retcode === 1101) {
        console.error('login required')
        break
      }
    }
  }
}
