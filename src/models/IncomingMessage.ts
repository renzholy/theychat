import { AddMsg } from '../type'
import { AbstractContact } from './Contact'

export abstract class AbstractIncomingMessage {
  protected addMsg: AddMsg
  protected contact: AbstractContact

  constructor(addMsg: AddMsg, contact: AbstractContact) {
    this.addMsg = addMsg
    this.contact = contact
  }

  get user(): AbstractContact {
    return this.contact
  }

  get content(): string {
    const speaker = this.addMsg.Content.match(/^(@\w+):<br\/>/)
    return speaker ? this.addMsg.Content.replace(/@\w+/, this.contact.name) : this.addMsg.Content
  }

  get raw(): AddMsg {
    return this.addMsg
  }
}

export class TextIncomingMessage extends AbstractIncomingMessage {
  get content(): string {
    return this.addMsg.Content
  }
}

export class UnknownIncomingMessage extends AbstractIncomingMessage {
  get content(): string {
    return '[未知类型消息]'
  }
}

export class IncomingMessageFactory {
  public static create(addMsg: AddMsg, contact: AbstractContact): AbstractIncomingMessage {
    switch (addMsg.MsgType) {
      case 1: {
        return new TextIncomingMessage(addMsg, contact)
      }
      default: {
        return new UnknownIncomingMessage(addMsg, contact)
      }
    }
  }
}
