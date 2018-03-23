import { filter, size } from 'lodash'

import { Contact, ContactFactroy } from './contact'

export class ContactStore {
  private store: {
    [key: string]: Contact
  } = {}

  public add(contact: Contact): void {
    this.store[contact.id] = contact
  }

  public get(userName: string): Contact {
    return this.store[userName] || ContactFactroy.stranger(userName)
  }

  public filter(callback: (contact: Contact) => boolean): Contact[] {
    return filter(this.store, callback)
  }

  public size(): number {
    return size(this.store)
  }
}
