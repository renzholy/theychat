import { AddMsg } from '../type'
import { Contact } from './Contact'
import { replaceEmoji } from '../utils'

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

  get id(): string {
    return this.addMsg.MsgId
  }

  get from(): Contact {
    return this.contacts[this.addMsg.FromUserName]
  }

  get to(): Contact {
    return this.contacts[this.addMsg.ToUserName]
  }

  get speaker(): Contact | null {
    const speaker = this.addMsg.Content.match(/^(@\w+):<br\/>/)
    return speaker && this.contacts[speaker[1]]
  }

  abstract get text(): string

  get content(): string {
    return this.speaker ? `${this.speaker.name}: ${this.text}` : this.text
  }

  get raw(): AddMsg {
    return this.addMsg
  }
}

export class TextMessage extends AbstractMessage {
  public type: 'TEXT'

  get text(): string {
    return replaceEmoji(this.addMsg.Content.replace(/^(@\w+):<br\/>/, ''))
  }
}

export class PictureMessage extends AbstractMessage {
  public type: 'PICTURE'

  get text(): string {
    return '[发来一张图片]'
  }
}

export class VoiceMessage extends AbstractMessage {
  public type: 'VOICE'

  get text(): string {
    return '[发来一条语音]'
  }
}

export class UnknownMessage extends AbstractMessage {
  public type: 'UNKNOWN'

  get text(): string {
    return '[未知类型消息]'
  }
}

export type Message = TextMessage | PictureMessage | VoiceMessage | UnknownMessage

export class MessageFactory {
  public static create(addMsg: AddMsg, contacts: {
    [key: string]: Contact
  }): Message {
    switch (addMsg.MsgType) {
      case 1: {
        return new TextMessage(addMsg, contacts)
      }
      case 3: {
        return new PictureMessage(addMsg, contacts)
      }
      case 34: {
        return new VoiceMessage(addMsg, contacts)
      }
      default: {
        return new UnknownMessage(addMsg, contacts)
      }
    }
  }
}
