#!/usr/bin/env node

import 'source-map-support/register'
import { readFile } from 'fs'
import { resolve } from 'path'

import { API } from './api'
import { notify } from 'node-notifier'

const pkg = require('../../package.json')

const options = [
  {
    name: 'version',
    type: 'bool',
    help: 'Print tool version and exit.'
  },
  {
    names: ['help', 'h'],
    type: 'bool',
    help: 'Print this help and exit.'
  },
  {
    names: ['verbose', 'v'],
    type: 'bool',
    help: 'Verbose output. Use multiple times for more verbose.'
  },
  {
    names: ['completion'],
    type: 'bool',
    help: 'Generate bash completion file'
  }
]

const api = new API()

if (process.env.NODE_ENV === 'dev') {
  console.debug = console.log
} else {
  console.debug = () => null
}

(async function () {
  let force = false
  while (true) {
    try {
      await api.init(force)
      await api.onIncomingMessage((msg) => {
        notify({
          title: msg.from.name,
          message: msg.content,
        })
      })
      force = true
    } catch (err) {
      console.log('restarting')
      console.error(err.message)
    }
  }
})()
