#!/usr/bin/env node

import 'source-map-support/register'

import { API } from './api'
import { ContactStore } from './models/contact-store'

const api = new API()

let store: ContactStore

api.onLogin((user) => {
  console.log('login succeed', user.name)
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
