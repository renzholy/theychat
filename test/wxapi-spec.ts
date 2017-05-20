import { WXAuth } from '../src/wxapi'
import { qrcode } from '../src/utils'
import test from 'ava'

test('login', async (t) => {
  const auth = await WXAuth.login(async (uuid) => {
    console.log(`https://login.weixin.qq.com/qrcode/${uuid}`)
    console.log(await qrcode(`https://login.weixin.qq.com/l/${uuid}`, true))
  })
  console.log(auth)
  t.truthy(typeof auth.uin === 'number')
})
