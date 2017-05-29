import { filter } from 'lodash'
import { Contact, Member, AddMsg } from './type'
import { replaceEmoji } from './utils'

export class Communicator {
  private contact: Contact | Member

  constructor(contact: Contact | Member) {
    this.contact = contact
  }

  get id(): string {
    return this.contact.UserName
  }

  get name(): string {
    return replaceEmoji((<Contact>this.contact).RemarkName
      || this.contact.NickName
      || this.contact.DisplayName
      || this.contact.UserName)
  }

  get isGroup(): boolean {
    return this.contact.UserName.startsWith('@@')
  }

  static stranger(username: string): Communicator {
    return new Communicator(<Contact>{
      UserName: username,
      RemarkName: 'Stranger',
    })
  }
}

export class IncomingMessage {
  private addMsg: AddMsg

  constructor(addMsg: AddMsg) {
    this.addMsg = addMsg
  }

  get content(): string {
    return this.addMsg.Content
  }

  get from(): string {
    return this.addMsg.FromUserName
  }

  get to(): string {
    return this.addMsg.ToUserName
  }
}

export class Communicators {
  private communicators: {
    [key: string]: Communicator
  } = {}

  get(id: string): Communicator {
    return this.communicators[id] || Communicator.stranger(id)
  }

  add(communicator: Communicator) {
    this.communicators[communicator.id] = communicator
  }

  allGroups(): Communicator[] {
    return filter(this.communicators, communicator => communicator.isGroup)
  }
}
