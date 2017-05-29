import { Contact, AddMsg } from './type'

export class Communicator {
  public contact: Contact

  constructor(contact: Contact) {
    this.contact = contact
  }

  get id(): string {
    return this.contact.UserName
  }

  get name(): string {
    return this.contact.RemarkName || this.contact.NickName || this.contact.DisplayName || this.contact.UserName
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
  public addMsg: AddMsg

  constructor(addMsg: AddMsg) {
    this.addMsg = addMsg
  }

  get content(): string {
    return this.addMsg.Content
  }

  get from(): string {
    return this.addMsg.FromUserName
  }
}
