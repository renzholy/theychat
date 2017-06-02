#!/usr/bin/env node

import 'source-map-support/register'
import { readFile } from 'fs'
import { resolve } from 'path'

import { API } from './api'
import { ContactStore } from './models/ContactStore'

const api = new API()

let store: ContactStore

api.onLogin(() => {
  console.log('login succeed')
})

api.onContacts((contactStore) => {
  console.log('contacts', contactStore.size())
  store = contactStore
})

api.onMessage((message) => {
  console.log(message.type, store.get(message.from).name, store.get(message.to).name, message.speaker ? store.get(message.speaker).name : '', message.text)
})

api.onError((err) => {
  console.error(err)
})
