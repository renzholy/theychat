import * as blessed from 'blessed'
import { Contact, Member } from './model'

export function init(): blessed.Widgets.Screen {
  const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
  })
  screen.key(['escape', 'q', 'C-c'], function (ch, key) {
    return process.exit(0);
  })
  return screen
}

export function logo(): blessed.Widgets.TextElement {
  const logo = blessed.box()
  const we = blessed.bigtext({
    left: '50%-25',
    content: 'We',
    style: {
      fg: 'green',
    },
  })
  const chat = blessed.bigtext({
    left: '50%-7',
    content: 'Chat',
    style: {
      fg: 'white',
    },
  })
  logo.append(chat)
  logo.append(we)
  return logo
}

export function loading(): blessed.Widgets.TextElement {
  return blessed.text({
    left: 'center',
    bottom: 0,
    content: 'Loading...',
    style: {
      fg: 'yellow',
    },
  })
}

export function qrcode(str: string): blessed.Widgets.TextElement {
  return blessed.text({
    bottom: 2,
    left: 'center',
    width: 'shrink',
    height: 'shrink',
    content: str,
    tags: true,
    style: {
      fg: 'white',
    },
  })
}

export function contactList(contacts: Contact[]): blessed.Widgets.BoxElement {
  const list = blessed.list({
    style: {
      selected: {
        fg: 'yellow',
      },
      item: {
        fg: 'white',
      },
    },
    items: contacts.map(contact => contact.RemarkName || contact.NickName.replace(/<\/?[^>]+>/g, '')),
    mouse: true,
    keys: true,
    vi: true,
  })
  const box = blessed.box({
    draggable: true,
    scrollable: true,
    top: '0',
    left: '0',
    width: '120',
    height: '50%',
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      border: {
        fg: '#f0f0f0'
      },
      hover: {
        bg: 'gray'
      }
    },
  })
  box.append(list)
  return box
}

export function memberList(contacts: Contact[]): blessed.Widgets.BoxElement {
  const list = blessed.list({
    style: {
      selected: {
        fg: 'yellow',
      },
      item: {
        fg: 'white',
      },
    },
    items: contacts.map(contact => contact.RemarkName || contact.NickName.replace(/<\/?[^>]+>/g, '')),
    mouse: true,
    keys: true,
    vi: true,
  })
  const box = blessed.box({
    draggable: true,
    top: '0',
    left: '0',
    width: '120',
    height: '50%',
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      border: {
        fg: '#f0f0f0'
      },
    },
  })
  box.append(list)
  return box
}
