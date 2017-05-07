import * as Redis from 'ioredis'
import {
  BaseRequest,
  SyncKey,
  User,
} from './model'

const redis = new Redis({
  keyPrefix: 'wechat:',
})

export async function getDeviceID(): Promise<string> {
  const deviceID = await redis.get('DeviceID')
  if (deviceID) {
    return deviceID
  }
  const newDeviceID = "e" + ("" + Math.random().toFixed(15)).substring(2, 17)
  await redis.set('DeviceID', newDeviceID)
  return newDeviceID
}

export async function getBaseRequest(): Promise<BaseRequest> {
  return JSON.parse(await redis.get('BaseRequest'))
}

export async function setBaseRequest(baseRequest: BaseRequest): Promise<void> {
  return await redis.set('BaseRequest', JSON.stringify(baseRequest))
}

export async function getSyncKey(): Promise<SyncKey> {
  return JSON.parse(await redis.get('SyncKey'))
}

export async function setSyncKey(syncKey: SyncKey): Promise<void> {
  return await redis.set('SyncKey', JSON.stringify(syncKey))
}

export async function getUser(): Promise<User> {
  return JSON.parse(await redis.get('User'))
}

export async function setUser(user: User): Promise<void> {
  return await redis.set('User', JSON.stringify(user))
}
