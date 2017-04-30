export type BaseResponse = {
  Ret: number,
  ErrMsg?: string,
}

export type Member = {
  Uin: number,
  UserName: string,
  NickName: string,
  AttrStatus: number,
  PYInitial: string,
  PYQuanPin: string,
  RemarkPYInitial: string,
  RemarkPYQuanPin: string,
  MemberStatus: number,
  DisplayName: string,
  KeyWord: string
}

export type Contact = {
  Uin: number,
  UserName: string,
  NickName: string,
  HeadImgUrl: string,
  ContactFlag: number,
  MemberCount: number,
  MemberList: Member[],
  RemarkName: string,
  HideInputBarFlag: number,
  Sex: number,
  Signature: string,
  VerifyFlag: number,
  OwnerUin: number,
  PYInitial: string,
  PYQuanPin: string,
  RemarkPYInitial: string,
  RemarkPYQuanPin: string,
  StarFriend: number,
  AppAccountFlag: number,
  Statues: number,
  AttrStatus: number,
  Province: string,
  City: string,
  Alias: string,
  SnsFlag: number,
  UniFriend: number,
  DisplayName: string,
  ChatRoomId: number,
  KeyWord: string,
  EncryChatRoomId: string,
  IsOwner: 0 | 1,
}

export type User = {
  Uin: number,
  UserName: string,
  NickName: string,
  HeadImgUrl: string,
  RemarkName: string,
  PYInitial: string,
  PYQuanPin: string,
  RemarkPYInitial: string,
  RemarkPYQuanPin: string,
  HideInputBarFlag: number,
  StarFriend: number,
  Sex: number,
  Signature: string,
  AppAccountFlag: number,
  VerifyFlag: number,
  ContactFlag: number,
  WebWxPluginSwitch: number,
  HeadImgFlag: number,
  SnsFlag: number,
}

export type MPArticle = {
  Title: string,
  Digest: string,
  Cover: string,
  Url: string,
}

export type MPSubscribeMsg = {
  UserName: string,
  MPArticleCount: number,
  MPArticleList: MPArticle[],
  Time: number,
  NickName: string,
}

export type Key = {
  Key: number,
  Val: number,
}

export type SyncKey = {
  Count: number,
  List: Key[],
}
