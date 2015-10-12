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

export const entitiesByIdSelector = state => state.entities.entitiesById
export const suggestionsSelector = state => state.entities.suggestions
export const predicatesSelector = state => state.entities.predicates
export const entitiesSelector = state => state.entities.entities
export const predicatesListSelector = createSelector(
  predicatesSelector,
  (predicates) => Object.keys(predicates.sort(compareByValue))
)
export const entitiesListSelector = createSelector(
  entitiesSelector,
  (entities) => Object.keys(entities.sort(compareByValue))
)

const compareByValue = (a, b) => {
  if (a.last_nom < b.last_nom)
    return -1
  if (a.last_nom > b.last_nom)
    return 1
  return 0
}

export const fetchSelector = state => state.fetch
