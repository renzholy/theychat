import {
  WXAuth,
} from '../src/wxapi'
import test from 'ava'

test('login', async (t) => {
  const auth = await WXAuth.login()
  console.log(auth)
  t.truthy(typeof auth.uin === 'number')
})
