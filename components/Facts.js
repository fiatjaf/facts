import React, { PropTypes, Component } from 'react'
import { factsSelector } from '../selectors'
import { createSelector } from 'reselect'
import { connect } from 'react-redux'

class Facts extends Component {
  render() {
    return (
      <ul>
        {this.props.facts.map((fact) =>
          <li key={fact._id}>
            {fact.triple[0]}
            {fact.triple[1]}
            {fact.triple[2]}
          </li>
        )}
      </ul>
    )
  }
}

const selector = createSelector(
  factsSelector,
  (facts) => {
    return {
      facts
    }
  }
)

export default connect(selector)(Facts)
