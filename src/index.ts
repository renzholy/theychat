#!/usr/bin/env node

import 'source-map-support/register'
import { readFile } from 'fs'
import { resolve } from 'path'

import { API } from './api'
import { Contact, ContactFactroy } from './models/Contact'

const api = new API()

let contactStore: {
  [key: string]: Contact
}

api.onLogin(() => {
  console.log('login succeed')
})

api.onContacts((contacts) => {
  console.log('contacts', Object.keys(contacts).length)
  contactStore = contacts
})

api.onMessage((msg) => {
  const json = msg.toJSON()
  json.from = contactStore[json.from] ? contactStore[json.from].name : ContactFactroy.stranger(json.from)
  json.to = contactStore[json.to] ? contactStore[json.to].name : ContactFactroy.stranger(json.to)
  if (json.speaker) {
    json.speaker = contactStore[json.speaker].name || ContactFactroy.stranger(json.speaker)
  }
  console.log(json)
})

api.onError((err) => {
  console.error(err)
})
