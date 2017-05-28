import * as Configstore from 'configstore'
import { WXAPI, WXAuth } from './wxapi'
import { qrcode } from '../src/utils'
const pkg = require('../../package.json')

const conf = new Configstore(pkg.name, null, {
  globalConfigPath: true,
})
let api: WXAPI

export async function init() {
  const { uuid, scan } = await WXAuth.uuid(conf.get('cookies'))
  if (scan) {
    console.log(`https://login.weixin.qq.com/qrcode/${uuid}`)
    console.log(await qrcode(`https://login.weixin.qq.com/l/${uuid}`, true))
  } else {
    console.log('push login')
  }
  const auth = await WXAuth.login(uuid)
  conf.set('cookies', auth.cookies)
  api = new WXAPI(auth)
}
