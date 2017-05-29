export type BaseRequest = {
  DeviceID: string
  Sid: string
  Skey: string
  Uin: number
}

export type BaseResponse = {
  Ret: number
  ErrMsg?: string
}

export type Member = {
  Uin: number
  UserName: string
  NickName: string
  AttrStatus: number
  PYInitial: string
  PYQuanPin: string
  RemarkPYInitial: string
  RemarkPYQuanPin: string
  MemberStatus: number
  DisplayName: string
  KeyWord: string
}

export type Contact = {
  Uin: number
  UserName: string
  NickName: string
  HeadImgUrl: string
  ContactFlag: number
  MemberCount: number
  MemberList: Member[]
  RemarkName: string
  HideInputBarFlag: number
  Sex: number
  Signature: string
  VerifyFlag: number
  OwnerUin: number
  PYInitial: string
  PYQuanPin: string
  RemarkPYInitial: string
  RemarkPYQuanPin: string
  StarFriend: number
  AppAccountFlag: number
  Statues: number
  AttrStatus: number
  Province: string
  City: string
  Alias: string
  SnsFlag: number
  UniFriend: number
  DisplayName: string
  ChatRoomId: number
  KeyWord: string
  EncryChatRoomId: string
  IsOwner: 0 | 1
}

export type User = {
  Uin: number
  UserName: string
  NickName: string
  HeadImgUrl: string
  RemarkName: string
  PYInitial: string
  PYQuanPin: string
  RemarkPYInitial: string
  RemarkPYQuanPin: string
  HideInputBarFlag: number
  StarFriend: number
  Sex: number
  Signature: string
  AppAccountFlag: number
  VerifyFlag: number
  ContactFlag: number
  WebWxPluginSwitch: number
  HeadImgFlag: number
  SnsFlag: number
}

export type MPArticle = {
  Title: string
  Digest: string
  Cover: string
  Url: string
}

export type MPSubscribeMsg = {
  UserName: string
  MPArticleCount: number
  MPArticleList: MPArticle[]
  Time: number
  NickName: string
}

export type SyncKeyItem = {
  Key: number
  Val: number
}

export type SyncKey = {
  Count: number
  List: SyncKeyItem[]
}

export type RecommendInfo = {
  Alias: string
  AttrStatus: number
  City: string
  Content: string
  NickName: string
  OpCode: number
  Province: string
  QQNum: number
  Scene: number
  Sex: number
  Signature: string
  Ticket: string
  UserName: string
  VerifyFlag: number
}

export type AppInfo = {
  AppID: string
  Type: number
}

export type AddMsg = {
  MsgId: string
  FromUserName: string
  ToUserName: string
  MsgType: number
  Content: string
  Status: number
  ImgStatus: number
  CreateTime: number
  VoiceLength: number
  PlayLength: number
  FileName: string
  FileSize: string
  MediaId: string
  Url: string
  AppMsgType: number
  StatusNotifyCode: number
  StatusNotifyUserName: string
  RecommendInfo: RecommendInfo
  ForwardFlag: number
  AppInfo: AppInfo
  HasProductId: number
  Ticket: string
  ImgHeight: number
  ImgWidth: number
  SubMsgType: number
  NewMsgId: number
  OriContent: string
}

export type ModContact = {

}

export type DelContact = {

}

export type ModChatRoomMember = {

}

export type Profile = {
  BitFlag: number
  UserName: {
    Buff: string
  }
  NickName: {
    Buff: string
  }
  BindUin: number
  BindEmail: {
    Buff: string
  }
  BindMobile: {
    Buff: string
  }
  Status: number
  Sex: number
  PersonalCard: number
  Alias: string
  HeadImgUpdateFlag: number
  HeadImgUrl: string
  Signature: string
}

export type Msg = {
  ClientMsgId: string
  Content: string
  FromUserName: string
  LocalID: string
  ToUserName: string
  Type: number
}
