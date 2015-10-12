import React, { Component, PropTypes } from 'react'
import Autocomplete from 'react-autocomplete'
import { createSelector } from 'reselect'
import { entitiesByIdSelector, suggestionsSelector, entitiesSelector, predicatesSelector } from '../selectors'
import { addFact } from '../actions'
import { connect } from 'react-redux'

class Adder extends Component {
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.state = {
      subject: '',
      predicate: '',
      object: ''
    }
  }

  handleSubmit(e) {
    e.preventDefault()

    this.add({
      subject: this.state.subject,
      predicate: this.state.predicate,
      object: this.state.object
    })
  }

  handleChange(name, e, value) {
    let update = {}
    update[name] = e.target.value
    this.setState(update)
  }

  add(triple) {
    const { dispatch } = this.props

    dispatch(addFact(triple))
  }

  render() {
    const { entities, predicates } = this.props

    let renderEntity = (item, isHighlighted) => (
      <div
        style={isHighlighted ? {color: '#fff', background: '#333'} : {color: '#333'}}
        key={item}
        id={item}
      >{item.name}</div>
    )

    return (
      <form onSubmit={this.handleSubmit}>
        <Autocomplete
          onChange={this.handleChange.bind(this, 'subject')}
          items={entities}
          getItemValue={(item) => item}
          renderItem={renderEntity}
        />
        <Autocomplete
          onChange={this.handleChange.bind(this, 'predicate')}
          items={predicates}
          getItemValue={(item) => item}
          renderItem={renderEntity}
        />
        <Autocomplete
          onChange={this.handleChange.bind(this, 'object')}
          items={entities}
          getItemValue={(item) => item}
          renderItem={renderEntity}
        />
        <button value="Add">Add</button>
      </form>
    )
  }
}

const selector = createSelector(
  entitiesByIdSelector,
  suggestionsSelector,
  entitiesSelector,
  predicatesSelector,
  (entitiesById, suggestions, entities, predicates) => {
    return {
      entitiesById,
      suggestions,
      entities,
      predicates,
    }
  }
)

export default connect(selector)(Adder)
