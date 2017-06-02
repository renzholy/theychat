#!/usr/bin/env node

import 'source-map-support/register'
import { readFile } from 'fs'
import { resolve } from 'path'

import { API } from './api'
const pkg = require(resolve('./package.json'))

const api = new API(pkg.name)

api.on(API.EVENT_CONTACTS, (contacts) => {
  console.log('contacts', Object.keys(contacts).length)
})

api.on(API.EVENT_MESSAGE, (msg) => {
  console.log(msg.toJSON())
})

api.on(API.EVENT_ERROR, (err) => {
  console.error(err)
})
