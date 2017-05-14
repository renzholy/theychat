#!/usr/bin/env node

import 'source-map-support/register'
import * as https from 'https'
import * as yargs from 'yargs'
import {
  login,
  contacts,
  message,
  watch
} from './commands'

yargs
  .command(login)
  .command(contacts)
  .command(message)
  .command(watch)
  .help()
  .argv
