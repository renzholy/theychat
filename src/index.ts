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

console.debug = console.log

const DeviceID = "e" + ("" + Math.random().toFixed(15)).substring(2, 17)

async function run() {
  const info0 = await jslogin()
  if (info0.code !== 200) {
    console.error('get qrcode error', info0)
    return
  }

  const info1 = await qrcode(`https://login.weixin.qq.com/l/${info0.uuid}`, true)
  console.log(info1)
  const info2 = await login(info0.uuid)
  console.log(info2)
  const info3 = await webwxnewloginpage(info2.redirect_uri)
  const base_request = <BaseRequest>{
    DeviceID,
    Sid: info3.wxsid,
    Skey: info3.skey,
    Uin: info3.wxuin,
  }
  console.log(info3)
  const info4 = await webwxinit(base_request)
  console.log(info4)
  let SyncKey
  while (true) {
    const info5 = await webwxsync(base_request, SyncKey || info4.SyncKey)
    console.log(info5.AddMsgList.map(msg => `${msg.FromUserName}: ${msg.Content}`))
  }
}

run().catch(console.error)
