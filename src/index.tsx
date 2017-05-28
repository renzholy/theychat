import * as React from 'react'
import * as ReactDOM from 'react-dom'
const DatePicker = require('antd/lib/date-picker')
import 'antd/lib/date-picker/style/css'

import { Hello } from './components/Hello'

ReactDOM.render(
  <Hello compiler='TypeScript' framework='React' />,
  document.getElementById('example')
)

ReactDOM.render(
  <DatePicker />,
  document.getElementById('example2')
)
