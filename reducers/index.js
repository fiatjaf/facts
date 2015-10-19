import immupdate from 'immupdate'
import { combineReducers } from 'redux'
import {
  ADDED_FACT,
  DELETED_FACT,
  REQUEST_FACTS,
  RECEIVE_FACTS,
  ENTITIES_RECEIVED,
  SUGGESTIONS_CHANGED,
  PREDICATES_RECEIVED,
  tupleToString
} from '../actions'

function facts(state={
  factsById: {}
}, action) {
  switch (action.type) {
    case RECEIVE_FACTS:
      if (action.error) {
        console.log('error on reducer', action.type, ':', action.error)
        return state
      } else {
        let factsById = {}
        action.facts.forEach(fact => {
          factsById[fact._id] = fact
        })
        return immupdate(state, 'factsById', factsById)
      }
    case ADDED_FACT:
      if (action.error) {
        console.log('error on reducer', action.type, ':', action.error)
        return state
      } else {
        return immupdate(state, `factsById.${action.fact._id}`, action.fact)
      }
    case DELETED_FACT:
      if (action.error) {
        console.log('error on reducer', action.type, ':', action.error)
        return state
      } else {
        return immupdate(state, `factsById.${action.id}`, null)
      }
    default:
      return state
  }
}

function entities(state={
  entities: [], /* a list of {_id: ..., in: {}, out: {}, ...} from entitiesDB */
  predicates: [], /* a list of predicates, i.e., raw strings */
  suggestions: {} /* a dict of tuples (converted to strings)
                     mapping to the the suggestions we shall show: {
                       "subjectid||predicate||_": [objectsuggestion...],
                       "subjectid||_||null": [predicatesuggestion...],
                       "_||null||null": [subjectsuggestion...],
                     } */
}, action) {
  switch (action.type) {
    case ENTITIES_RECEIVED:
      if (action.error) {
        console.log('error on reducer', action.type, ':', action.error)
        return state
      } else {
        return immupdate(state, {
          entities: action.entities,
          suggestions: {
            [tupleToString(['_', null, null])]: action.entities,
            [tupleToString([null, null, '_'])]: action.entities
          }
        })
      }
    case PREDICATES_RECEIVED:
      if (action.error) {
        console.log('error on reducer', action.type, ':', action.error)
        return state
      } else {
        return immupdate(state, {
          predicates: action.predicates,
          suggestions: {
            [tupleToString([null, '_', null])]: action.predicates
          }
        })
      }
    case SUGGESTIONS_CHANGED:
      if (action.error) {
        console.log('error on reducer', action.type, ':', action.error)
        return state
      } else {
        return immupdate(state, {
          suggestions: {
            [tupleToString(action.tuple)]: action.suggestions
          }
        })
      }
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
      if (action.error) {
        console.log('error on reducer', action.type, ':', action.error)
        return immupdate(state, {
          isFetching: false,
          fetchingFrom: null,
          fetchError: action.reason
        })
      } else {
        return immupdate(state, {
          isFetching: false,
          lastFetch: Date.now(),
          fetchingFrom: null,
          fetchError: null
        })
      }
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
