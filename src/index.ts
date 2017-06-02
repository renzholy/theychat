#!/usr/bin/env node

import 'source-map-support/register'
import { readFile } from 'fs'
import { resolve } from 'path'

import { API } from './api'

const api = new API()

api.onLogin(() => {
  console.log('login succeed')
})

api.onContacts((contactStore) => {
  console.log('contacts', contactStore.size())
})

api.onMessage((msg) => {
  console.log(msg.toJSON())
})

api.onError((err) => {
  console.error(err)
})
