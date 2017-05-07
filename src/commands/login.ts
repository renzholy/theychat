import {
  jslogin,
  login,
  webwxnewloginpage,
  webwxinit,
  webwxsync,
  webwxstatusnotify,
} from '../api'
import {
  qrcode,
} from '../utils'

export const command = 'login'

export const describe = 'scan & login'

export const builder = {}

export async function handler(argv) {
  const { uuid, code } = await jslogin()
  console.log('scan to login')
  console.log(await qrcode(`https://login.weixin.qq.com/l/${uuid}`, true))
  const redirect_uri = await login(uuid)
  await webwxnewloginpage(redirect_uri)
  console.log('init', (await webwxinit()).BaseResponse.Ret)
  console.log('sync', (await webwxsync()).BaseResponse.Ret)
  console.log('status notify', (await webwxstatusnotify()).BaseResponse.Ret)
  console.log('login succeed')
  process.exit(0)
}
