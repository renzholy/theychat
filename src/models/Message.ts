import { map } from 'lodash'

import { AddMsg } from '../type'
import { Contact } from './Contact'
import { replaceEmoji } from '../utils'

export abstract class AbstractMessage {
  public abstract type: string
  protected addMsg: AddMsg

  public constructor(addMsg: AddMsg) {
    this.addMsg = addMsg
  }

  public get id(): string {
    return this.addMsg.MsgId
  }

  public get from(): string {
    return this.addMsg.FromUserName
  }

  public get to(): string {
    return this.addMsg.ToUserName
  }

  public get speaker(): string | null {
    const speaker = this.addMsg.Content.match(/^(@\w+):<br\/>/)
    return speaker && speaker[1]
  }

  public get text(): string {
    return this.speaker ? `${this.speaker}: ${this.content}` : this.content
  }

  protected abstract get content(): string

  public get raw(): AddMsg {
    return this.addMsg
  }

  public toJSON(): {
    [key: string]: any
  } {
    return {
      id: this.id,
      from: this.from,
      to: this.to,
      speaker: this.speaker,
      type: this.type,
      text: this.text,
    }
  }
}

export class TextMessage extends AbstractMessage {
  public type = 'TEXT'

  protected get content(): string {
    return replaceEmoji(this.addMsg.Content.replace(/^(@\w+):<br\/>/, ''))
  }
}

export class PictureMessage extends AbstractMessage {
  public type = 'PICTURE'
  public hasPicture = true

  protected get content(): string {
    return '[发来一张图片]'
  }

  public get size(): number {
    const matched = this.addMsg.Content.match(/ length ?= ?"(\d+)"/)
    return matched ? parseInt(matched[1]) : 0
  }

  public toJSON(): {
    [key: string]: any
  } {
    return {
      ...super.toJSON(),
      hasPicture: this.hasPicture,
      size: this.size
    }
  }
}

export class VoiceMessage extends AbstractMessage {
  public type = 'VOICE'

  protected get content(): string {
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

  public toJSON(): {
    [key: string]: any
  } {
    return {
      ...super.toJSON(),
      size: this.size,
      duration: this.duration,
    }
  }
}

export class EmotionMessage extends AbstractMessage {
  public type = 'EMOTION'
  public hasPicture = true

  protected get content(): string {
    return '[发来一个表情]'
  }

  public get size(): number {
    const matched = this.addMsg.Content.match(/ len ?= ?"(\d+)"/)
    return matched ? parseInt(matched[1]) : 0
  }

  public toJSON(): {
    [key: string]: any
  } {
    return {
      ...super.toJSON(),
      hasPicture: this.hasPicture,
      size: this.size
    }
  }
}

export class LinkMessage extends AbstractMessage {
  public type = 'LINK'
  public hasPicture = true

  protected get content(): string {
    return `[分享链接] ${this.title}`
  }

  public get title(): string {
    return this.addMsg.FileName
  }

  public get description(): string {
    const matched = this.addMsg.Content.match(/des&gt;(&lt;!\[CDATA\[)?(.+)(&(amp;)?gt;)?&lt;\/des&gt;/)
    return matched ? matched[2] : ''
  }

  public get url(): string {
    return this.addMsg.Url
  }

  public toJSON(): {
    [key: string]: any
  } {
    return {
      ...super.toJSON(),
      hasPicture: this.hasPicture,
      title: this.title,
      description: this.description,
      url: this.url,
    }
  }
}

export class UnknownMessage extends AbstractMessage {
  public type = 'UNKNOWN'

  protected get content(): string {
    return '[未知类型消息]'
  }
}

export type Message = TextMessage | PictureMessage | VoiceMessage | EmotionMessage | LinkMessage | UnknownMessage

export class MessageFactory {
  public static create(addMsg: AddMsg): Message {
    switch (addMsg.MsgType) {
      case 1: {
        return new TextMessage(addMsg)
      }
      case 3: {
        return new PictureMessage(addMsg)
      }
      case 34: {
        return new VoiceMessage(addMsg)
      }
      case 47: {
        return new EmotionMessage(addMsg)
      }
      case 49: {
        return new LinkMessage(addMsg)
      }
      default: {
        return new UnknownMessage(addMsg)
      }
    }
  }

  public static isTextMessage(message: AbstractMessage): message is TextMessage {
    return message.type === 'TEXT'
  }

  public static isPictureMessage(message: AbstractMessage): message is PictureMessage {
    return message.type === 'PICTURE'
  }

  public static isVoiceMessage(message: AbstractMessage): message is VoiceMessage {
    return message.type === 'VOICE'
  }

  public static isEmotionMessage(message: AbstractMessage): message is EmotionMessage {
    return message.type === 'EMOTION'
  }

  public static isLinkMessage(message: AbstractMessage): message is LinkMessage {
    return message.type === 'LINK'
  }

  public static isUnknownMessage(message: AbstractMessage): message is UnknownMessage {
    return message.type === 'UNKNOWN'
  }
}
