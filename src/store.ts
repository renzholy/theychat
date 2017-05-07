import * as Redis from 'ioredis'
import {
  flatten,
  mapValues,
} from 'lodash'
import {
  BaseRequest,
  SyncKey,
  User,
  Contact,
} from './model'

const redis = new Redis({
  keyPrefix: 'wechat:',
})

export function generateNewDeviceID(): string {
  return 'e' + Math.random().toFixed(15).substring(2)
}

export async function getDeviceID(): Promise<string> {
  const deviceID = await redis.get('DeviceID')
  if (deviceID) {
    return deviceID
  }
  const newDeviceID = generateNewDeviceID()
  await redis.set('DeviceID', newDeviceID)
  return newDeviceID
}

export async function getBaseRequest(): Promise<BaseRequest> {
  return JSON.parse(await redis.get('BaseRequest'))
}

export async function setBaseRequest(baseRequest: BaseRequest): Promise<void> {
  await redis.set('BaseRequest', JSON.stringify(baseRequest))
}

export async function getSyncKey(): Promise<SyncKey> {
  return JSON.parse(await redis.get('SyncKey'))
}

export async function setSyncKey(syncKey: SyncKey): Promise<void> {
  await redis.set('SyncKey', JSON.stringify(syncKey))
}

export async function getUser(): Promise<User> {
  return JSON.parse(await redis.get('User'))
}

export async function setUser(user: User): Promise<void> {
  await redis.set('User', JSON.stringify(user))
}

export async function updateContacts(contacts: Contact[]): Promise<void> {
  await redis.hmset('Contacts', flatten(contacts.map(contact => [contact.UserName, JSON.stringify(contact)])))
}

export async function setContacts(contacts: Contact[]): Promise<void> {
  await redis.pipeline()
    .del('Contacts')
    .hmset('Contacts', flatten(contacts.map(contact => [contact.UserName, JSON.stringify(contact)])))
    .exec()
}

export async function getContacts(): Promise<{ [key: string]: Contact }> {
  return mapValues(await redis.hgetall('Contacts'), contact => JSON.parse(contact))
}
