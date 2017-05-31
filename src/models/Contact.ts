import { ucs2 } from 'punycode'
import { chunk } from 'lodash'
import * as emojis from 'emojis-list'

import { Contact as ContactType, Member } from '../type'
import { replaceEmoji } from '../utils'

export abstract class AbstractContact {
  public abstract type: string
  protected contact: ContactType | Member

  constructor(contact: ContactType | Member) {
    this.contact = contact
  }

  get id(): string {
    return this.contact.UserName
  }

  get name(): string {
    return replaceEmoji((<ContactType>this.contact).RemarkName || this.contact.NickName)
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
