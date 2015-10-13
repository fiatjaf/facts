import { factsDB, entitiesDB } from '../pouch'

export const ADDED_FACT = 'ADDED_FACT'
export const ADDED_FACT_ERROR = 'ADDED_FACT_ERROR'
export const REQUEST_FACTS = 'REQUEST_FACTS'
export const RECEIVE_FACTS = 'RECEIVE_FACTS'
export const RECEIVE_FACTS_ERROR = 'RECEIVE_FACTS_ERROR'
export const ENTITIES_RECEIVED = 'ENTITIES_RECEIVED'
export const ENTITIES_ERROR = 'ENTITIES_ERROR'
export const PREDICATES_RECEIVED = 'PREDICATES_RECEIVED'
export const PREDICATES_ERROR = 'PREDICATES_ERROR'
export const ENTITY_DETAILS_RECEIVED = 'ENTITY_DETAILS_RECEIVED'
export const ENTITY_DETAILS_ERROR = 'ENTITY_DETAILS_ERROR'

export function addFact(triple) {
  return dispatch => {
    let fact = {
      _id: Date.now() + '-' + localStorage.getItem('_machine_name') || '_',
      triple: [triple.subject, triple.predicate, triple.object]
    }
    return factsDB.put(fact)
    .then(res => {
      fact._rev = res.rev
      dispatch({
        type: ADDED_FACT,
        fact
      })
    })
    .catch(err => dispatch({
      type: ADDED_FACT_ERROR,
      reason: err
    }))
  }
}

export function fetchFactsIfNeeded(from) {
  return (dispatch, getState) => {
    let state = getState()
    if (state.fetch.isFetching && state.fetch.fetchingFrom == from) {
      return
    }
    return dispatch(fetchFacts(from));
  }
}
function fetchFacts(from) {
  return dispatch => {
    dispatch({
      type: REQUEST_FACTS,
      from
    })
    return factsDB.allDocs({
      descending: true,
      include_docs: true,
      startkey: from.toString(),
      limit: 100
    })
    .then(res => res.rows.map(r => r.doc))
    .then(facts => dispatch({
      type: RECEIVE_FACTS,
      from: from,
      facts: facts,
      receivedAt: Date.now()
    }))
    .catch(err => dispatch({
      type: RECEIVE_FACTS_ERROR,
      reason: err,
      from,
    }))
  }
}

export function fetchEntitiesList() {
  return dispatch => {
    return entitiesDB.allDocs({
      include_docs: true
    })
    .then(res => res.rows.map(row => row.doc))
    .then(entities => dispatch({
      type: ENTITIES_RECEIVED,
      entities
    }))
    .catch(err => dispatch({
      type: ENTITIES_ERROR,
      reason: err
    }))
  }
}

export function fetchPredicatesList() {
  return dispatch => {
    return factsDB.query('facts/predicates', {
      reduce: true,
      group: 1
    })
    .then(res => res.rows.map(row => row.key[0]))
    .then(predicates => dispatch({
      type: PREDICATES_RECEIVED,
      predicates
    }))
    .catch(err => dispatch({
      type: PREDICATES_ERROR,
      reason: err
    }))
  }
}
