import test from 'ava'
import { AddMsg } from '../src/type'
import { MessageFactory, PictureMessage, VoiceMessage } from '../src/models/Message'
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
