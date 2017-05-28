#!/usr/bin/env node

import 'source-map-support/register'
import { createParser } from 'dashdash'
import { readFile } from 'fs'
import { resolve } from 'path'
const pkg = require('../../package.json')

import commands from './commands'

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

const parser = createParser({ options })

const opts = parser.parse(process.argv)

if (opts.verbose) {
  console.debug = console.log
} else {
  console.debug = () => null
}

console.debug("opts:", opts)

commands(opts._args)

if (opts.version) {
  console.log(pkg.version)
  process.exit(0)
}

if (opts.help) {
  const help = parser.help({ includeEnv: true }).trimRight()
  console.log(`usage: ${pkg.name} [OPTIONS]\noptions:\n${help}`)
  process.exit(0)
}

if (opts.completion) {
  console.log(parser.bashCompletion({ name: pkg.name }))
  process.exit(0)
}
