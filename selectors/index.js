import { createSelector } from 'reselect'

export const factsSelector = state => state.facts.factsList
export const factsLengthSelector = state => factsSelector(state).length
export const factsByIdSelector = createSelector(
  factsSelector,
  (factsList) => {
    let factsById = {}
    factsList.forEach(function (fact) {
      factsById[fact._id] = fact
    })
    return factsById
  }
)

export const predicatesSelector = state => state.entities.predicates
export const entitiesSelector = state => state.entities.entities
export const entitiesByIdSelector = createSelector(
  entitiesSelector,
  (entitiesList) => {
    let entitiesById = {}
    entitiesList.forEach(function (e) {
      entitiesById[e._id] = e
    })
    return entitiesById
  }
)

export const fetchSelector = state => state.fetch
