import { ucs2 } from 'punycode'
import { chunk } from 'lodash'
import * as emojis from 'emojis-list'

import { Contact, Member } from '../type'

export abstract class AbstractContact {
  protected contact: Contact | Member
  private static LRO = new RegExp(String.fromCharCode(parseInt('0x202D', 16)), 'g') // Left-to-Right Override
  private static RLO = new RegExp(String.fromCharCode(parseInt('0x202E', 16)), 'g') // Right-to-Left Override
  private static EOF = new RegExp(String.fromCharCode(parseInt('0xFE0F', 16)), 'g')

  constructor(contact: Contact | Member) {
    this.contact = contact
  }

  private static replaceEmoji(str: string): string {
    let text = str.replace(/<\/?[^>]+>/g, (a) => {
      const matched = a.match(/emoji(\w+)/)
      if (matched) {
        try {
          return ucs2.encode(chunk(matched[1].split(''), 5).map(c => parseInt(c.join(''), 16)))
        } catch (err) {
          return ''
        }
      }
      return ''
    })
    emojis.forEach(emoji => {
      if (text.indexOf(emoji) >= 0) {
        text = text.replace(new RegExp(emoji, 'g'), e => e + ' ')
        return
      }
    })
    return text.replace(AbstractContact.LRO, '').replace(AbstractContact.RLO, '').replace(AbstractContact.EOF, '')
  }

  get id(): string {
    return this.contact.UserName
  }

  get name(): string {
    return AbstractContact.replaceEmoji((<Contact>this.contact).RemarkName || this.contact.NickName)
      || this.contact.DisplayName || this.contact.UserName
  }

  abstract type: string
}

export class SpecialContact extends AbstractContact {
  type: 'SPECIAL'
}

export class GroupContact extends AbstractContact {
  type: 'GROUP'
}

export class OfficialContact extends AbstractContact {
  type: 'OFFICIAL'
}

export class PersonalContact extends AbstractContact {
  type: 'PERSONAL'
}

export class ContactFactroy {
  public static create(contact: Contact | Member): AbstractContact {
    if (!contact.UserName.startsWith('@')) {
      return new SpecialContact(contact)
    }
    if (contact.UserName.startsWith('@@')) {
      return new GroupContact(contact)
    }
    if ((<Contact>contact).VerifyFlag && ((<Contact>contact).VerifyFlag & 8) !== 0) {
      return new OfficialContact(contact)
    }
    return new PersonalContact(contact)
  }

  public static isSpecialContact(contact: AbstractContact): contact is SpecialContact {
    return contact.type === 'SPECIAL'
  }

  public static isGroupContact(contact: AbstractContact): contact is GroupContact {
    return contact.type === 'GROUP'
  }
}
