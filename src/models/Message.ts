import { AddMsg } from '../type'
import { Contact } from './Contact'

export abstract class AbstractMessage {
  public abstract type: string
  protected addMsg: AddMsg
  protected contacts: {
    [key: string]: Contact
  }

  constructor(addMsg: AddMsg, contacts: {
    [key: string]: Contact
  }) {
    this.addMsg = addMsg
    this.contacts = contacts
  }

  get user(): Contact {
    return this.contacts[this.addMsg.FromUserName]
  }

  get content(): string {
    const speaker = this.addMsg.Content.match(/^(@\w+):<br\/>/)
    return speaker ? this.addMsg.Content.replace(/@\w+/, this.contacts[speaker[1]].name) : this.addMsg.Content
  }

  get raw(): AddMsg {
    return this.addMsg
  }
}

export class TextMessage extends AbstractMessage {
  public type: 'TEXT'
}

export class UnknownMessage extends AbstractMessage {
  public type: 'UNKNOWN'

  get content(): string {
    return super.content + '[未知类型消息]'
  }
}

export type Message = TextMessage | UnknownMessage

export class MessageFactory {
  public static create(addMsg: AddMsg, contacts: {
    [key: string]: Contact
  }): Message {
    switch (addMsg.MsgType) {
      case 1: {
        return new TextMessage(addMsg, contacts)
      }
      default: {
        return new UnknownMessage(addMsg, contacts)
      }
    }
  }
}
