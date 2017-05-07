import 'source-map-support/register'
import * as https from 'https'
import * as yargs from 'yargs'
import {
  login,
  contacts,
} from './commands'

yargs
  .command(login)
  .command(contacts)
  .help()
  .argv
