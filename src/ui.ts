import * as blessed from 'blessed'

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
  const we = blessed.bigtext({
    left: 10,
    content: 'We',
    style: {
      fg: 'green',
    },
  })
  const chat = blessed.bigtext({
    left: 0,
    content: '  Chat',
    style: {
      fg: 'white',
    },
  })
  we.append(chat)
  return we
}

export function qrcode(str: string): blessed.Widgets.TextElement {
  return blessed.text({
    bottom: 2,
    left: 16,
    width: 'shrink',
    height: 'shrink',
    content: str,
    tags: true,
    style: {
      fg: 'white',
    },
  })
}

export function contactList(contacts: string[]): blessed.Widgets.ListElement {
  return blessed.list({
    style: {
      selected: {
        fg: 'yellow',
      },
      item: {
        fg: 'white',
      },
    },
    items: contacts,
    mouse: true,
    keys: true,
    vi: true,
  })
}
