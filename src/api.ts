import * as Configstore from 'configstore'
import { filter } from 'lodash'
import { WXAPI, WXAuth } from './wxapi'
import { qrcode } from '../src/utils'
import { Contact, AddMsg } from './type'
const pkg = require('../../package.json')

const conf = new Configstore(pkg.name, null, {
  globalConfigPath: true,
})

let api: WXAPI

if (conf.has('auth')) {
  api = new WXAPI(new WXAuth(conf.get('auth')))
}

const contacts: {
  [key: string]: Contact
} = {}

export async function init() {
  const { uuid, scan } = await WXAuth.uuid(conf.get('auth.cookies'))
  if (scan) {
    console.log(`https://login.weixin.qq.com/qrcode/${uuid}`)
    console.log(await qrcode(`https://login.weixin.qq.com/l/${uuid}`, true))
  } else {
    console.log('push login')
  }
  const auth = await WXAuth.login(uuid)
  conf.set('auth', auth.toJSON())
  api = new WXAPI(auth)
}

export async function watch(cb: (msg: AddMsg) => void) {
  await api.webwxinit()
  await api.webwxstatusnotify()
  for (let contact of (await api.webwxgetcontact()).MemberList) {
    contacts[contact.UserName] = contact
  }
  for (let contact of (await api.webwxbatchgetcontact(filter(contacts, contact => contact.UserName.startsWith('@@')))).ContactList) {
    contacts[contact.UserName] = contact
  }
  while (true) {
    const { retcode, selector } = await api.synccheck()
    console.debug(retcode, selector)
    if (retcode === 0 && selector !== 0) {
      const { AddMsgList } = await api.webwxsync()
      for (let msg of AddMsgList) {
        console.debug(msg)
        await cb(msg)
      }
    }
    if (retcode === 1101) {
      console.error('login required')
      break
    }
  }
}

export function getContact(username: string): Contact | null {
  return contacts[username] || null
}
