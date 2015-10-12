import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { fetchFactsIfNeeded, fetchPredicatesList, fetchEntitiesList } from './actions'
import { factsLengthSelector, fetchSelector } from './selectors'
import Adder from './components/Adder'
import Facts from './components/Facts'

class App extends Component {
  constructor(props) {
    super(props)
    this.handleRefreshClick = this.handleRefreshClick.bind(this)
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch(fetchFactsIfNeeded(Date.now()))
    dispatch(fetchEntitiesList())
    dispatch(fetchPredicatesList())
  }

  handleRefreshClick(e) {
    e.preventDefault()

    const { dispatch } = this.props
    dispatch(fetchFactsIfNeeded(Date.now()))
  }

  render() {
    const { fetch, factsLength } = this.props

    return (
      <div>
        <Adder />
        <p>
          {fetch.lastFetch &&
            <span>
              Last updated at {new Date(fetch.lastFetch).toLocaleTimeString()}.
              {' '}
            </span>
          }
          {!fetch.isFetching &&
            <a href="#"
               onClick={this.handleRefreshClick}>
              Refresh
            </a>
          }
        </p>
        {fetch.isFetching && factsLength < 0 &&
          <h2>Loading...</h2>
        }
        {!fetch.isFetching && fetch.errorMessage &&
          <h2>{ fetch.errorMessage }</h2>
        }
        {factsLength > 0 &&
          <div style={{ opacity: fetch.isFetching ? 0.5 : 1 }}>
            <Facts />
          </div>
        }
      </div>
    )
  }
}

const selector = createSelector(
  factsLengthSelector,
  fetchSelector,
  (factsLength, fetch) => {
    return {
      fetch,
      factsLength
    }
  }
)

export default connect(selector)(App)
