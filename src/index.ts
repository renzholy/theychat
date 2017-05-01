import 'source-map-support/register'
import * as https from 'https'
import * as blessed from 'blessed'
import { sleep, qrcode } from './utils'
import {
  jslogin,
  login,
  webwxinit,
  webwxnewloginpage,
} from './api'

console.debug = console.log

const DeviceId = "e" + ("" + Math.random().toFixed(15)).substring(2, 17)

const screen = blessed.screen({
  smartCSR: true,
})
screen.render()
screen.key(['escape', 'q', 'C-c'], function (ch, key) {
  return process.exit(0);
})

async function run() {
  const info = await jslogin()
  if (info.code !== 200) {
    console.error('get qrcode error', info)
    return
  }

  const welcome1 = blessed.bigtext({
    left: 0,
    content: 'We',
    style: {
      fg: 'green',
    },
  })
  const welcome2 = blessed.bigtext({
    left: 0,
    content: '  Chat',
    style: {
      fg: 'white',
    },
  })
  screen.append(welcome2)
  screen.append(welcome1)

  const code = blessed.text({
    bottom: 0,
    left: 0,
    width: 'shrink',
    height: 'shrink',
    content: await qrcode(`https://login.weixin.qq.com/l/${info.uuid}`, true),
    tags: true,
    style: {
      fg: 'white',
    },
  })
  screen.append(code)
  screen.render()

  const info2 = await login(info.uuid)
  console.log(info2)
  const info3 = await webwxnewloginpage(info2.redirect_uri)
  console.log(info3)
  const info4 = await webwxinit(DeviceId, info3.wxsid, info3.wxuin)
  console.log(info4)
}

run().catch(console.error)
