import { AddMsg } from '../type'
import { Contact } from './Contact'
import { replaceEmoji } from '../utils'

export abstract class AbstractMessage {
  public abstract type: string
  protected addMsg: AddMsg
  protected contacts: {
    [key: string]: Contact
  }

  public constructor(addMsg: AddMsg, contacts: {
    [key: string]: Contact
  }) {
    this.addMsg = addMsg
    this.contacts = contacts
  }

  public get id(): string {
    return this.addMsg.MsgId
  }

  public get from(): Contact {
    return this.contacts[this.addMsg.FromUserName]
  }

  public get to(): Contact {
    return this.contacts[this.addMsg.ToUserName]
  }

  public get speaker(): Contact | null {
    const speaker = this.addMsg.Content.match(/^(@\w+):<br\/>/)
    return speaker && this.contacts[speaker[1]]
  }

  abstract get text(): string

  protected get content(): string {
    return this.speaker ? `${this.speaker.name}: ${this.text}` : this.text
  }

  public get raw(): AddMsg {
    return this.addMsg
  }
}

export class TextMessage extends AbstractMessage {
  public type = 'TEXT'

  public get text(): string {
    return replaceEmoji(this.addMsg.Content.replace(/^(@\w+):<br\/>/, ''))
  }
}

export class PictureMessage extends AbstractMessage {
  public type = 'PICTURE'

  public get text(): string {
    return '[发来一张图片]'
  }

  public get size(): number {
    const matched = this.addMsg.Content.match(/ length ?= ?"(\d+)"/)
    return matched ? parseInt(matched[1]) : 0
  }
}

export class VoiceMessage extends AbstractMessage {
  public type = 'VOICE'

  public get text(): string {
    return '[发来一条语音]'
  }

  public get duration(): number {
    const matched = this.addMsg.Content.match(/ voicelength ?= ?"(\d+)"/)
    return matched ? parseInt(matched[1]) : 0
  }

  public get size(): number {
    const matched = this.addMsg.Content.match(/ length ?= ?"(\d+)"/)
    return matched ? parseInt(matched[1]) : 0
  }
}

export class EmotionMessage extends AbstractMessage {
  public type = 'EMOTION'

  public get text(): string {
    return '[发来一个表情]'
  }

  public get size(): number {
    const matched = this.addMsg.Content.match(/ len ?= ?"(\d+)"/)
    return matched ? parseInt(matched[1]) : 0
  }
}


export class UnknownMessage extends AbstractMessage {
  public type = 'UNKNOWN'

  public get text(): string {
    return '[未知类型消息]'
  }
}

export type Message = TextMessage | PictureMessage | VoiceMessage | EmotionMessage | UnknownMessage

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
      case 47: {
        return new EmotionMessage(addMsg, contacts)
      }
      default: {
        return new UnknownMessage(addMsg, contacts)
      }
    }
  }

  public static isTextMessage(message: AbstractMessage): message is TextMessage {
    return message.type === 'TEXT'
  }

  public static PictureMessage(message: AbstractMessage): message is PictureMessage {
    return message.type === 'PICTURE'
  }

  public static VoiceMessage(message: AbstractMessage): message is VoiceMessage {
    return message.type === 'VOICE'
  }

  public static EmotionMessage(message: AbstractMessage): message is EmotionMessage {
    return message.type === 'EMOTION'
  }

  public static UnknownMessage(message: AbstractMessage): message is UnknownMessage {
    return message.type === 'UNKNOWN'
  }
}
