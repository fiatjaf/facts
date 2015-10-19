import { createSelector } from 'reselect'

export const factsByIdSelector = state => state.facts.factsById
export const factsListSelector = createSelector(
  factsByIdSelector,
  (factsById) => {
    let factsList = []
    for (var id in factsById) {
      if (factsById[id]) {
        factsList.push(factsById[id])
      }
    }
    return factsList
  }
)
export const factsLengthSelector = createSelector(
  factsListSelector,
  (factsList) => factsList.length
)
export const factsByDateSelector = createSelector(
  factsListSelector,
  (factsList) => {
    return factsList.concat().sort((a, b) => {
      if (a._id < b._id) {
        return -1
      }
      if (a._id > b._id) {
        return 1
      }
      return 0
    })
  }
)

export const predicatesSelector = state => state.entities.predicates
export const entitiesListSelector = state => state.entities.entities
export const entitiesByIdSelector = createSelector(
  entitiesListSelector,
  (entitiesList) => {
    let entitiesById = {}
    entitiesList.forEach(function (e) {
      entitiesById[e._id] = e
    })
    return entitiesById
  }
)
export const suggestionsSelector = state => state.entities.suggestions

export const fetchSelector = state => state.fetch
