import { ucs2 } from 'punycode'
import { chunk } from 'lodash'
import * as emojis from 'emojis-list'

import { Contact as ContactType, Member } from '../type'

export abstract class AbstractContact {
  public abstract type: string
  protected contact: ContactType | Member
  private static LRO = new RegExp(String.fromCharCode(parseInt('0x202D', 16)), 'g') // Left-to-Right Override
  private static RLO = new RegExp(String.fromCharCode(parseInt('0x202E', 16)), 'g') // Right-to-Left Override
  private static EOF = new RegExp(String.fromCharCode(parseInt('0xFE0F', 16)), 'g')

  constructor(contact: ContactType | Member) {
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
    return AbstractContact.replaceEmoji((<ContactType>this.contact).RemarkName || this.contact.NickName)
      || this.contact.DisplayName || this.contact.UserName
  }

  match(keyword: string): boolean {
    return `${this.contact.PYInitial} ${this.contact.PYQuanPin}`.toLowerCase().indexOf(keyword.toLowerCase()) >= 0
      || this.name.indexOf(keyword) >= 0
  }
}

export class SpecialContact extends AbstractContact {
  public type: 'SPECIAL'
}

export class GroupContact extends AbstractContact {
  public type: 'GROUP'
}

export class OfficialContact extends AbstractContact {
  public type: 'OFFICIAL'
}

export class PersonalContact extends AbstractContact {
  public type: 'PERSONAL'
}

export type Contact = SpecialContact | GroupContact | OfficialContact | PersonalContact

export class ContactFactroy {
  public static create(contact: ContactType | Member): Contact {
    if (!contact.UserName.startsWith('@')) {
      return new SpecialContact(contact)
    }
    if (contact.UserName.startsWith('@@')) {
      return new GroupContact(contact)
    }
    if ((<ContactType>contact).VerifyFlag && ((<ContactType>contact).VerifyFlag & 8) !== 0) {
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
