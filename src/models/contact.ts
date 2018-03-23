import { Contact as ContactType, Member, User } from '../type'
import { replaceEmoji } from '../utils'

export abstract class AbstractContact {
  public abstract type: string
  protected contact: ContactType | Member | User

  constructor(contact: ContactType | Member | User) {
    this.contact = contact
  }

  get id(): string {
    return this.contact.UserName
  }

  get name(): string {
    return replaceEmoji((<ContactType>this.contact).RemarkName || this.contact.NickName)
      || (<ContactType | Member>this.contact).DisplayName || this.contact.UserName
  }

  public get raw(): ContactType | Member | User {
    return this.contact
  }
}

export class SpecialContact extends AbstractContact {
  public type = 'SPECIAL'
}

export class GroupContact extends AbstractContact {
  public type = 'GROUP'
}

export class OfficialContact extends AbstractContact {
  public type = 'OFFICIAL'
}

export class PersonalContact extends AbstractContact {
  public type = 'PERSONAL'
}

export class StrangeContact extends AbstractContact {
  public type = 'STRANGE'
}

export type Contact = SpecialContact | GroupContact | OfficialContact | PersonalContact | StrangeContact

export class ContactFactroy {
  public static create(contact: ContactType | Member | User): Contact {
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

  public static stranger(userName: string): Contact {
    return new StrangeContact(<ContactType>{
      RemarkName: 'Stranger',
      UserName: userName,
      PYInitial: 'MSR',
    })
  }

  public static isSpecialContact(contact: AbstractContact): contact is SpecialContact {
    return contact.type === 'SPECIAL'
  }

  public static isGroupContact(contact: AbstractContact): contact is GroupContact {
    return contact.type === 'GROUP'
  }

  public static isOfficialContact(contact: AbstractContact): contact is OfficialContact {
    return contact.type === 'OFFICIAL'
  }

  public static isPersonalContact(contact: AbstractContact): contact is PersonalContact {
    return contact.type === 'PERSONAL'
  }

  public static isStrangeContact(contact: AbstractContact): contact is StrangeContact {
    return contact.type === 'STRANGE'
  }
}
