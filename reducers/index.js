import immupdate from 'immupdate'
import { combineReducers } from 'redux'
import {
  ADDED_FACT,
  ADDED_FACT_ERROR,
  REQUEST_FACTS,
  RECEIVE_FACTS,
  RECEIVE_FACTS_ERROR,
  ENTITIES_RECEIVED,
  ENTITIES_ERROR,
  PREDICATES_RECEIVED,
  PREDICATES_ERROR,
  ENTITY_DETAILS_RECEIVED,
  ENTITY_DETAILS_ERROR,
} from '../actions'

function facts(state={
  factsList: []
}, action) {
  switch (action.type) {
    case RECEIVE_FACTS:
      return immupdate(state, 'factsList', action.facts)
    case ADDED_FACT:
      return immupdate(state, 'factsList', [action.fact].concat(state.factsList))
    case ADDED_FACT_ERROR:
      return state
    default:
      return state
  }
}

function entities(state={
  entities: [], /* a list of {_id: ..., in: {}, out: {}, ...} from entitiesDB */
  predicates: [], /* a list of predicates, i.e., raw strings */
}, action) {
  switch (action.type) {
    case ENTITIES_RECEIVED:
      return immupdate(state, 'entities', action.entities)
    case ENTITIES_ERROR:
      return state
    case PREDICATES_RECEIVED:
      return immupdate(state, 'predicates', action.predicates)
    case PREDICATES_ERROR:
      return state
    case ENTITY_DETAILS_RECEIVED:
      return state
    case ENTITY_DETAILS_ERROR:
      return state
    default:
      return state
  }
}

function fetch(state={
  isFetching: false,
  lastFetch: Date.now(),
  fetchError: null
}, action) {
  switch (action.type) {
    case REQUEST_FACTS:
      return immupdate(state, {
        isFetching: true,
        fetchingFrom: action.from,
        fetchError: null
      })
    case RECEIVE_FACTS:
      return immupdate(state, {
        isFetching: false,
        lastFetch: Date.now(),
        fetchingFrom: null,
        fetchError: null
      })
    case RECEIVE_FACTS_ERROR:
      return immupdate(state, {
        isFetching: false,
        fetchingFrom: null,
        fetchError: action.reason
      })
    default:
      return state
  }
}

const rootReducer = combineReducers({
  fetch,
  facts,
  entities
});

export default rootReducer;
