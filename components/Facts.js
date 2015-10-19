import React, { PropTypes, Component } from 'react'
import { createSelector } from 'reselect'
import { connect } from 'react-redux'
import { factsByDateSelector } from '../selectors'
import { deleteFact } from '../actions'

class Facts extends Component {
  constructor(props) {
    super(props)
    this.clickDeleteItem.bind(this)
  }

  clickDeleteItem (fact, e) {
    e.preventDefault()
    const { dispatch } = this.props

    dispatch(deleteFact(fact))
  }

  render() {
    return (
      <table>
        <tbody>
        {this.props.facts.map((fact) =>
          <tr key={fact._id}>
            <td>{fact.triple[0]}</td>
            <td>{fact.triple[1]}</td>
            <td>{fact.triple[2]}</td>
            <td><a href="#" onClick={this.clickDeleteItem.bind(this, fact)}>delete</a></td>
          </tr>
        )}
        </tbody>
      </table>
    )
  }
}

const selector = createSelector(
  factsByDateSelector,
  (facts) => {
    return {
      facts
    }
  }
)

export default connect(selector)(Facts)
