import test from 'ava'
import { AddMsg } from '../src/type'
import { MessageFactory, PictureMessage, VoiceMessage, LinkMessage } from '../src/models/Message'
import fixtures from './fixtures/message'

test('text message', t => {
  const message = MessageFactory.create(fixtures['1'], {})
  t.is(message.type, 'TEXT')
  t.is(message.text, 'test')
})

test('picture message', t => {
  const message = MessageFactory.create(fixtures['3'], {})
  t.is(message.type, 'PICTURE')
  t.is(message.text, '[发来一张图片]')
  t.is((<PictureMessage>message).size, 35251)
})

test('voice message', t => {
  const message = MessageFactory.create(fixtures['34'], {})
  t.is(message.type, 'VOICE')
  t.is(message.text, '[发来一条语音]')
  t.is((<VoiceMessage>message).size, 2330)
  t.is((<VoiceMessage>message).duration, 1481)
})

test('emotion message', t => {
  const message = MessageFactory.create(fixtures['47'], {})
  t.is(message.type, 'EMOTION')
  t.is(message.text, '[发来一个表情]')
  t.is((<VoiceMessage>message).size, 88387)
})

test('link message', t => {
  const message = MessageFactory.create(fixtures['49'], {})
  t.is(message.type, 'LINK')
  t.is(message.text, '[分享链接] 可以一个字都不读，但必须健身')
  t.is((<LinkMessage>message).title, '可以一个字都不读，但必须健身')
  t.is((<LinkMessage>message).description, '来自「「X博士」公众号有更新」')
  t.is((<LinkMessage>message).url, 'http://m.okjike.com/messages/592c1ae04c976200112e78b3?username=d25026f2-18ce-48aa-9ea7-c05a25446368')
})
