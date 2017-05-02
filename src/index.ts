import 'source-map-support/register'
import * as https from 'https'
import { sleep, qrcode } from './utils'
import { BaseRequest } from './model'
import {
  jslogin,
  login,
  webwxinit,
  webwxnewloginpage,
  webwxsync,
} from './api'
import * as ui from './ui'

console.debug = console.log

const screen = ui.init()
const logo = ui.logo()
screen.append(logo)
screen.render()

const DeviceID = "e" + ("" + Math.random().toFixed(15)).substring(2, 17)

async function run() {
  const info0 = await jslogin()
  if (info0.code !== 200) {
    console.error('get qrcode error', info0)
    return
  }

  const code = ui.qrcode(await qrcode(`https://login.weixin.qq.com/l/${info0.uuid}`, true))
  screen.append(code)
  screen.render()

  const info2 = await login(info0.uuid)

  const loading = ui.loading()
  screen.append(loading)
  screen.render()

  const info3 = await webwxnewloginpage(info2.redirect_uri)
  const base_request = <BaseRequest>{
    DeviceID,
    Sid: info3.wxsid,
    Skey: info3.skey,
    Uin: info3.wxuin,
  }

  code.detach()
  logo.detach()
  loading.detach()
  screen.render()

  const info4 = await webwxinit(base_request)

  const list = ui.contactList(info4.ContactList)
  screen.append(list)
  screen.render()

  let SyncKey
  while (true) {
    const info5 = await webwxsync(base_request, SyncKey || info4.SyncKey)
    await sleep(1000)
    // console.log(info5.AddMsgList.map(msg => `${msg.FromUserName}: ${msg.Content}`))
  }
}

run().catch(console.error)
