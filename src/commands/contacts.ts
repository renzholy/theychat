import {
  forEach,
  map,
  sortBy,
  chain,
} from 'lodash'
import * as Table from 'cli-table2'
import {
  webwxgetcontact,
} from '../api'
import {
  Contact,
} from '../model'
import {
  setContacts,
  getContacts,
} from '../store'
import {
  formatText,
} from '../utils'

const table = new Table({
  head: ['Type', 'Remark Name', 'Nick Name', 'ID'],
  colWidths: [10, 10, 20],
  chars: {
    'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
    'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
    'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
    'right': '', 'right-mid': '', 'middle': ' ',
  },
  style: {
    'padding-left': 0,
    'padding-right': 0,
  },
})

export const command = 'contacts [action]'

export const describe = 'fetch, list, search, add, delete contacts'

export const builder = {}

function contactType(contact: Contact) {
  if (contact.VerifyFlag === 0 && contact.AttrStatus === 0) {
    return 'Group'
  }
  if (contact.VerifyFlag === 0) {
    return 'Contact'
  }
}

export async function handler(argv) {
  switch (argv.action) {
    case 'fetch': {
      const json = await webwxgetcontact()
      console.log('fetched', json.MemberList.length, 'contacts')
      await setContacts(json.MemberList)
      break
    }
    case 'list': {
      const contacts = chain(await getContacts())
        .filter(contact => contact.VerifyFlag === 0)
        .sortBy('AttrStatus')
        .map(contact => {
          return [
            contact.AttrStatus === 0 ? 'Group' : 'Contact',
            formatText(contact.RemarkName),
            formatText(contact.NickName),
            contact.UserName,
          ]
        })
        .value()
      forEach(contacts, contact => {
        table.push(contact)
      })
      console.log(table.toString())
      break
    }
    default: {
      console.error('unknown command')
    }
  }
  process.exit(0)
}
