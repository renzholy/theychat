import { AddMsg } from '../type'
import { Contact } from './Contact'

export abstract class AbstractIncomingMessage {
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

export class TextIncomingMessage extends AbstractIncomingMessage {
  public type: 'TEXT'
}

export class UnknownIncomingMessage extends AbstractIncomingMessage {
  public type: 'UNKNOWN'

  get content(): string {
    return super.content + '[未知类型消息]'
  }
}

export type IncomingMessage = TextIncomingMessage | UnknownIncomingMessage

export class IncomingMessageFactory {
  public static create(addMsg: AddMsg, contacts: {
    [key: string]: Contact
  }): IncomingMessage {
    switch (addMsg.MsgType) {
      case 1: {
        return new TextIncomingMessage(addMsg, contacts)
      }
      default: {
        return new UnknownIncomingMessage(addMsg, contacts)
      }
    }
  }
}
