import {
  jslogin,
} from '../src/wxapi'
import {
  qrcode,
} from '../src/utils'
import test from 'ava'

test('jslogin', async (t) => {
  const { uuid, code } = await jslogin()
  t.is(code, 200)
  console.log(await qrcode(`https://login.weixin.qq.com/l/${uuid}`, true))
})
