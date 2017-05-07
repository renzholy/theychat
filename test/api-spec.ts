import {
  jslogin,
  login,
  webwxnewloginpage,
  webwxinit,
  synccheck,
  webwxsync,
  webwxgetcontact,
  webwxsendmsg,
} from '../src/api'
import {
  qrcode,
} from '../src/utils'
import test from 'ava'

test('login', async (t) => {
  const { uuid, code } = await jslogin()
  t.is(code, 200)
  console.log(await qrcode(`https://login.weixin.qq.com/l/${uuid}`, true))

  const redirect_uri = await login(uuid)
  console.log(redirect_uri)
  t.true(redirect_uri.startsWith('http'))

  await webwxnewloginpage(redirect_uri)
})

test('init', async (t) => {
  const response = await webwxinit()
  console.log(response)
  t.is(response.BaseResponse.Ret, 0)
})

test('check sync', async (t) => {
  const response = await synccheck()
  console.log(response)
  t.is(response.retcode, 0)
})

test('sync', async (t) => {
  const response = await webwxsync()
  console.log(response)
  t.is(response.BaseResponse.Ret, 0)
})

test('get contacts', async (t) => {
  const response = await webwxgetcontact()
  console.log(response)
  t.is(response.BaseResponse.Ret, 0)
})

test('send msg', async (t) => {
  const response = await webwxsendmsg('filehelper', '123')
  console.log(response)
  t.is(response.BaseResponse.Ret, 0)
})
