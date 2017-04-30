import 'source-map-support/register'
import * as qrcode from 'qrcode-terminal'
import * as https from 'https'
import {
  jslogin,
  login,
  webwxinit,
  webwxnewloginpage,
} from './api'

console.debug = console.log

const DeviceId = "e" + ("" + Math.random().toFixed(15)).substring(2, 17)

async function run() {
  const info = await jslogin()
  if (info.code !== 200) {
    console.error('get qrcode error', info)
    return
  }
  const loginUrl = `https://login.weixin.qq.com/l/${info.uuid}`
  qrcode.generate(loginUrl)
  const info2 = await login(info.uuid)
  console.log(info2)
  const info3 = await webwxnewloginpage(info2.redirect_uri)
  console.log(info3)
  const info4 = await webwxinit(DeviceId, info3.wxsid, info3.wxuin)
  console.log(info4)
}

run().catch(console.error)
