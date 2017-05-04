import {
  jslogin,
  login,
  webwxnewloginpage,
  webwxinit,
  webwxsync,
  webwxgetcontact,
  webwxsendmsg,
} from '../src/api'
import { qrcode } from '../src/utils'
import test from 'ava'

const DeviceID = "e" + ("" + Math.random().toFixed(15)).substring(2, 17)

test('api', async t => {
  const { uuid, code } = await jslogin()
  t.is(code, 200)
  console.log(await qrcode(`https://login.weixin.qq.com/l/${uuid}`, true))

  const { redirect_uri } = await login(uuid)
  t.true(redirect_uri.startsWith('http'))

  const { wxsid, skey, wxuin, pass_ticket } = await webwxnewloginpage(redirect_uri)
  t.true(skey.startsWith('@'))

  const base_request = {
    DeviceID,
    Sid: wxsid,
    Skey: skey,
    Uin: wxuin,
  }

  const { ContactList, BaseResponse: { Ret }, SyncKey, User } = await webwxinit(base_request)
  t.is(Ret, 0)

  const sync = await webwxsync(base_request, SyncKey)
  t.is(sync.BaseResponse.Ret, 0)

  const contacts = await webwxgetcontact(skey, pass_ticket)
  t.is(contacts.BaseResponse.Ret, 0)

  const sent = await webwxsendmsg(base_request, User.UserName, 'filehelper', '123')
  t.is(sent.BaseResponse.Ret, 0)
})
