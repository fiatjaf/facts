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
  SUGGESTIONS_RECEIVED,
  SUGGESTIONS_ERROR,
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
  entities: [], /* a list of {entityId: count} to help in autocomplete */
  predicates: [], /* same as entities, but {predicate: count} */
  entitiesById: {}, /* {entityId: {fetchError, lastFetch, in, out} } */
  suggestions: {} /* {stringKey: {fetchError, lastFetch, suggestedValues}} */
}, action) {
  switch (action.type) {
    case ENTITIES_RECEIVED:
      return immupdate(state, 'entitiesIds', action.entities)
    case ENTITIES_ERROR:
      return state
    case PREDICATES_RECEIVED:
      return immupdate(state, 'predicates', action.predicates)
    case PREDICATES_ERROR:
      return state
    case ENTITY_DETAILS_RECEIVED:
      return immupdate(state, `entitiesById.${action.entityId}`, {
        in: action.facts.in,
        out: action.facts.out,
        fetchError: null,
        lastFetch: Date.now()
      })
    case ENTITY_DETAILS_ERROR:
      return immupdate(state, `entitiesById.${action.entityId}.fetchError`, action.reason)
    case SUGGESTIONS_RECEIVED:
      return immupdate(state, `suggestions.${action.stringKey}`, {
        suggestedValues: action.suggestedValues,
        fetchError: null,
        lastFetch: Date.now()
      })
    case SUGGESTIONS_ERROR:
      return immupdate(state, `suggestions.${action.stringKey}.fetchError`, action.reason)
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
