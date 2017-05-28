import 'source-map-support/register'
import test from 'ava'
import { WXAuth, WXAPI } from '../src/wxapi'
import { qrcode } from '../src/utils'

let api: WXAPI

test.serial(async (t) => {
  const auth = await WXAuth.login(async (uuid) => {
    console.log(`https://login.weixin.qq.com/qrcode/${uuid}`)
    console.log(await qrcode(`https://login.weixin.qq.com/l/${uuid}`, true))
  })
  api = new WXAPI(auth)
  t.truthy(typeof auth.uin === 'number')
})

test.serial('webwxinit', async (t) => {
  const response = await api.webwxinit()
  t.is(response.BaseResponse.Ret, 0)
})

test.serial('webwxstatusnotify', async (t) => {
  const response = await api.webwxstatusnotify()
  t.is(response.BaseResponse.Ret, 0)
})

test.serial('synccheck', async (t) => {
  const response = await api.synccheck()
  t.is(response.retcode, 0)
})

test.serial('webwxsync', async (t) => {
  const response = await api.webwxsync()
  t.is(response.BaseResponse.Ret, 0)
})

test.serial('webwxgetcontact', async (t) => {
  const response = await api.webwxgetcontact()
  t.is(response.BaseResponse.Ret, 0)
})
