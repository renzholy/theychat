#!/usr/bin/env node

import 'source-map-support/register'
import { readFile } from 'fs'
import { resolve } from 'path'

import { API } from './api'
const pkg = require(resolve('./package.json'))

const api = new API(pkg.name)

if (process.env.NODE_ENV === 'dev') {
  console.debug = console.log
} else {
  console.debug = () => null
}

(async function () {
  try {
    await api.init()
    await api.onMessage((msg) => {
      console.log(msg.from.name, msg.text)
    })
  } catch (err) {
    console.error(err.message)
  }
})()
