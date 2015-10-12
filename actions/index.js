import pouch from '../pouch'

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
export const SUGGESTIONS_RECEIVED = 'SUGGESTIONS_RECEIVED'
export const SUGGESTIONS_ERROR = 'SUGGESTIONS_ERROR'

export function addFact(triple) {
  return dispatch => {
    let fact = {
      _id: Date.now() + '-' + localStorage.getItem('_machine_name') || '_',
      triple: [triple.subject, triple.predicate, triple.object]
    }
    return pouch.put(fact)
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
    return pouch.allDocs({
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
    return pouch.query('facts/entities', {
      reduce: true,
      group: 1
    })
    .then(res => res.rows.map(function (r) {
      let e = {}
      e[r.key[0]] = r.value
      return e
    }))
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
    return pouch.query('facts/predicates', {
      reduce: true,
      group: 1
    })
    .then(res => res.rows.map(function (r) {
      let e = {}
      e[r.key[0]] = r.value
      return e
    }))
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

export function fetchEntityDetailsIfNeeded(entityId) {
  return (dispatch, getState) => {
    let state = getState()
    let entity = state.entitiesById[entityId]
    /* super naïve check: a 10min threshold */
    if (entity && Date.now() - entity.lastFetch < 60000) {
      return
    }
    return dispatch(fetchEntityDetails(entityId));
  }
}
function fetchEntityDetails(entityId) {
  return dispatch => {
    return pouch.query('facts/entities', {
      reduce: false,
      startkey: [entityId],
      endkey: [entityId, {}]
    })
    .then((res) => {
      let facts = {out: {}, in: {}}
      res.rows.forEach(function (row) {
        let base = row.key[2] ? entity.in : entity.out
        base[row.key[1]] = base[row.key[1]] || []
        base[row.key[1]].push(row.value)
      })
      dispatch({
        type: ENTITY_DETAILS_RECEIVED,
        entityId,
        facts
      })
    })
    .catch(err => dispatch({
      type: ENTITY_DETAILS_ERROR,
      reason: err,
      entityId
    }))
  }
}

/* tuple is something like
  ['someid', 'somepredicate', '_'],
  ['someid', '_', 'someotherid'] or
  ['someid', '_', null]
 */
export function fetchSuggestionsIfNeeded(tuple) {
  return (dispatch, getState) => {
    let state = getState()
    let stringKey = suggestTupleToString(tuple)
    let current = state.suggestions[stringKey]
    /* super naïve check: a 10min threshold */
    if (current && Date.now() - current.lastFetch < 60000) {
      return
    }
    return dispatch(fetchSuggestions(tuple));
  }
}
function fetchSuggestions(tuple) {
  return dispatch => {
    return pouch.query('facts/suggest', {
      reduce: false,
      startkey: tuple,
      endkey: [...tuple, {}]
    })
    .then((res) => {
      let suggestedValues = []
      res.rows.forEach(function (row) {
        suggestedValues.push(row.value)
      })
      dispatch({
        type: SUGGESTIONS_RECEIVED,
        stringKey: suggestTupleToString(tuple),
        suggestedValues
      })
    })
    .catch(err => dispatch({
      type: SUGGESTIONS_ERROR,
      reason: err
    }))
  }
}
const suggestTupleToString = tuple => tuple.join(':::')
