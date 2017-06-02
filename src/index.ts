#!/usr/bin/env node

import 'source-map-support/register'
import { readFile } from 'fs'
import { resolve } from 'path'

import { API } from './api'
import { Contact, ContactFactroy } from './models/Contact'
import { Message } from './models/Message'

const api = new API()

let contacts: {
  [key: string]: Contact
}

api.on(API.EVENT_CONTACTS, (_contacts: {
  [key: string]: Contact
}) => {
  console.log('contacts', Object.keys(_contacts).length)
  contacts = _contacts
})

api.on(API.EVENT_MESSAGE, (msg: Message) => {
  const json = msg.toJSON()
  json.from = contacts[json.from].name || ContactFactroy.stranger(json.from)
  json.to = contacts[json.to].name || ContactFactroy.stranger(json.to)
  if (json.speaker) {
    json.speaker = contacts[json.speaker].name || ContactFactroy.stranger(json.speaker)
  }
  console.log(json)
})

api.on(API.EVENT_ERROR, (err: Error) => {
  console.error(err)
})
