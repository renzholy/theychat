import {
  map,
  zip,
} from 'lodash'
import {
  getContacts,
} from '../store'
import {
  formatText,
} from '../utils'

export const command = 'contacts [action]'

export const describe = 'list, search, add, delete contacts'

export const builder = {}

export async function handler(argv) {
  switch (argv.action) {
    case 'list': {
      const contacts = await getContacts()
      console.log(map(contacts, contact => {
        return [
          formatText(contact.RemarkName || contact.NickName || contact.DisplayName || contact.UserName),
          `${contact.Province} ${contact.City}`,
          contact.VerifyFlag,
          contact.AttrStatus,
        ]
      }))
      break
    }
    default: {
      console.error('unknown command')
    }
  }
  process.exit(0)
}
