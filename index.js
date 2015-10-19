import 'isomorphic-fetch'
import 'babel-core/polyfill'
import React from 'react'
import ReactDOM  from 'react-dom'
import { Provider } from 'react-redux'
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react'
import DiffMonitor from 'redux-devtools-diff-monitor'
import App from './App'
import store from './store'

if (process.env.NODE_ENV == 'production') {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>
    , document.getElementById('root')
  )

} else {
  ReactDOM.render(
    <div>
      <Provider store={store}>
        <App />
      </Provider>
      <DebugPanel top right bottom>
        <DevTools store={store} monitor={LogMonitor} />
      </DebugPanel>
    </div>
    , document.getElementById('root')
  )
}
