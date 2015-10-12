import { compose, createStore, applyMiddleware } from 'redux'
import { devTools, persistState } from 'redux-devtools'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import rootReducer from '../reducers'

const initialState = {}

const middle = applyMiddleware(
  thunkMiddleware,
  createLogger()
)

let store

if (process.env.NODE_ENV === 'production') {
  store = middle(createStore)(rootReducer, initialState)
} else {
  const finalCreateStore = compose(
    middle,
    devTools(),
    persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
  )(createStore)
  store = finalCreateStore(rootReducer, initialState)
}

export default store
