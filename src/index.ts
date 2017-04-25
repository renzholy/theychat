import * as request from 'request-promise-native'
import * as qrcode from 'qrcode-terminal'
import * as https from 'https'

const rq = request.defaults({
})

console.debug = console.log

async function jslogin(): Promise<{
  code: number,
  uuid: string,
}> {
  console.log('uuid')
  const html = await rq({
    url: 'https://login.web.wechat.com/jslogin',
    qs: {
      appid: 'wx782c26e4c19acffb',
      redirect_uri: 'https://web.wechat.com/cgi-bin/mmwebwx-bin/webwxnewloginpage',
      fun: 'new',
      lang: 'zh_CN',
      _: Date.now(),
    }
  })
  console.debug(html)
  return {
    code: parseInt(html.match(/QRLogin.code ?= ?(\d+)/)[1]),
    uuid: html.match(/QRLogin.uuid ?= ?"(.+)"/)[1],
  }
}

async function login(uuid: string): Promise<{
  redirect_uri: string,
}> {
  console.log('login', uuid)
  let code = 0
  while (true) {
    const html = await request({
      url: 'https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login',
      qs: {
        loginicon: true,
        uuid,
        tip: code === 201 ? 0 : 1,
        r: ~Date.now(),
        _: Date.now(),
      },
      pool: false,
    })
    console.debug(html)
    code = parseInt(html.match(/window.code ?= ?(\d+)/)[1])
    if (code === 200) {
      return {
        redirect_uri: html.match(/redirect_uri="(.+)"/)[1],
      }
    }
  }
}

async function webwxnewloginpage(redirect_uri: string): Promise<{
  wxuin: string,
  skey: string,
  wxsid: string,
  pass_ticket: string,
}> {
  console.log('webwxnewloginpage', redirect_uri)
  const html = await request({
    url: redirect_uri,
    headers: {
      Host: 'wx2.qq.com',
    },
    followRedirect: false,
    simple: false,
    pool: false,
  })
  console.debug(html)
  return {
    wxuin: html.match(/<wxuin>(.+)<\/wxuin>/)[1],
    skey: html.match(/<skey>(.+)<\/skey>/)[1],
    wxsid: html.match(/<wxsid>(.+)<\/wxsid>/)[1],
    pass_ticket: html.match(/<pass_ticket>(.+)<\/pass_ticket>/)[1],
  }
}

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
}

run()
