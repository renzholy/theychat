import 'source-map-support/register'
import * as https from 'https'
import * as yargs from 'yargs'
import {
  login,
  contacts,
  message,
} from './commands'

yargs
  .command(login)
  .command(contacts)
  .command(message)
  .help()
  .argv
