import 'source-map-support/register'
import * as https from 'https'
import { sleep, qrcode as qrcodeStr } from './utils'
import { init, logo, qrcode, contactList } from './ui'
import {
  jslogin,
  login,
  webwxinit,
  webwxnewloginpage,
} from './api'

console.debug = console.log

const DeviceId = "e" + ("" + Math.random().toFixed(15)).substring(2, 17)

const UI = init()

async function run() {
  const info = await jslogin()
  if (info.code !== 200) {
    console.error('get qrcode error', info)
    return
  }

  const l = logo()
  UI.append(l)
  UI.render()

  const c = qrcode(await qrcodeStr(`https://login.weixin.qq.com/l/${info.uuid}`, true))
  UI.append(c)
  UI.render()

  const info2 = await login(info.uuid)

  l.detach()
  c.detach()
  UI.render()

  const info3 = await webwxnewloginpage(info2.redirect_uri)
  const info4 = await webwxinit(DeviceId, info3.wxsid, info3.wxuin)

  UI.append(contactList(info4.ContactList.map(contact => contact.NickName)))
  UI.render()
}

run().catch(console.error)
