import { factsDB, entitiesDB } from '../pouch'

export const ADDED_FACT = 'ADDED_FACT'
export const DELETED_FACT = 'DELETED_FACT'
export const REQUEST_FACTS = 'REQUEST_FACTS'
export const RECEIVE_FACTS = 'RECEIVE_FACTS'
export const ENTITIES_RECEIVED = 'ENTITIES_RECEIVED'
export const SUGGESTIONS_CHANGED = 'SUGGESTIONS_CHANGED'
export const PREDICATES_RECEIVED = 'PREDICATES_RECEIVED'
export const ENTITY_DETAILS_RECEIVED = 'ENTITY_DETAILS_RECEIVED'

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
    .catch(error => dispatch({
      type: ADDED_FACT,
      error
    }))
  }
}

export function deleteFact (fact) {
  return dispatch => {
    factsDB.remove(fact)
    .then(res => dispatch({
      type: DELETED_FACT,
      id: res.id
    }))
    .catch(error => dispatch({
      type: DELETED_FACT,
      error
    }))
  }
}

export function fetchFactsIfNeeded (from) {
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
      receivedAt: Date.now(),
      from,
      facts
    }))
    .catch(error => dispatch({
      type: RECEIVE_FACTS,
      error,
      from
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
    .catch(error => dispatch({
      type: ENTITIES_RECEIVED,
      error
    }))
  }
}

export function fetchPredicatesList () {
  return dispatch => {
    return factsDB.query('facts/predicates', {
      reduce: true,
      group: 1
    })
    .then(res => res.rows.map(row => row.key))
    .then(predicates => dispatch({
      type: PREDICATES_RECEIVED,
      predicates
    }))
    .catch(error => dispatch({
      type: PREDICATES_RECEIVED,
      error
    }))
  }
}

export function updateAutoCompleteItemsIfNeeded (tuple) {
  return (dispatch, getState) => {
    let suggestions = getState().entities.suggestions
    if (suggestions[tupleToString(tuple)]) {
      return
    }
    return dispatch(updateAutocompleteItems(tuple))
  }
}

function updateAutocompleteItems (tuple) {
  return dispatch => {
    return factsDB.query('facts/suggest', {
      reduce: false,
      startkey: tuple,
      endkey: [...tuple, {}]
    })
    .then(res => res.rows.map(row => row.value))
    .then(suggestions => dispatch({
      type: SUGGESTIONS_CHANGED,
      tuple,
      suggestions
    }))
    .catch(error => dispatch({
      type: SUGGESTIONS_CHANGED,
      error
    }))
  }
}
export const tupleToString = tuple => tuple.join('||')
