import React, { Component, PropTypes } from 'react'
import Sifter from 'sifter'
import Autocomplete from 'react-autocomplete'
import immupdate from 'immupdate'
import { factsDB } from '../pouch'
import { createSelector } from 'reselect'
import { entitiesByIdSelector, entitiesListSelector, predicatesSelector, suggestionsSelector } from '../selectors'
import { addFact, updateAutoCompleteItemsIfNeeded, tupleToString } from '../actions'
import { connect } from 'react-redux'

class Adder extends Component {
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSelect = this.handleSelect.bind(this)

    const { entities, predicates } = this.props
    this.state = {
      triple: {
        subject: null,
        predicate: null,
        object: null,
      }
    }
  }

  handleSubmit (e) {
    e.preventDefault()
    const { subject, predicate, object } = this.state.triple

    if (!subject || !predicate || !object) { return }
    if (
      subject[0] == ':' && (!subject.split(':')[1] || !subject.split(':')[2])
      || object[0] == ':' && (!object.split(':')[1] || !object.split(':')[2])
    ) { return }

    this.add({
      subject: subject,
      predicate: predicate,
      object: object
    })
  }

  handleSelect (name, value, item) {
    // update value being typed
    let update = {}
    update[name] = value
    this.setState(immupdate(this.state, { triple: update }))
  }

  handleChange (name, e, value) {
    // update value being typed
    let update = {}
    update[name] = e.target.value
    this.setState(immupdate(this.state, { triple: update }))

    // getting suggestions from factsDB
    const { subject, predicate, object } = this.state.triple
    const { entities, predicates,
            dispatch } = this.props

    let tuple = {
      'subject': ['_', predicate || null, object || null],
      'predicate': [subject || null, '_', object || null],
      'object': [subject || null, predicate || null, '_']
    }[name]

    dispatch(updateAutoCompleteItemsIfNeeded(tuple))
  }

  add(triple) {
    const { dispatch } = this.props

    dispatch(addFact(triple))
  }

  render() {
    const { subject, predicate, object } = this.state.triple
    const suggestions = {
      subject: this.props.suggestions[tupleToString(['_', predicate, object])] || [],
      predicate: this.props.suggestions[tupleToString([subject, '_', object])] || [],
      object: this.props.suggestions[tupleToString([subject, predicate, '_'])] || []
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <Autocomplete
          onChange={this.handleChange.bind(this, 'subject')}
          onSelect={this.handleSelect.bind(this, 'subject')}
          items={suggestions.subject}
          getItemValue={this.getItemValue}
          renderItem={this.renderEntity}
          shouldItemRender={this.shouldEntityRender}
        />
        <Autocomplete
          onChange={this.handleChange.bind(this, 'predicate')}
          onSelect={this.handleSelect.bind(this, 'predicate')}
          items={suggestions.predicate}
          getItemValue={this.getItemValue}
          renderItem={this.renderEntity}
        />
        <Autocomplete
          onChange={this.handleChange.bind(this, 'object')}
          onSelect={this.handleSelect.bind(this, 'object')}
          items={suggestions.object}
          getItemValue={this.getItemValue}
          renderItem={this.renderEntity}
          shouldItemRender={this.shouldEntityRender}
        />
        <button value="Add">Add</button>
      </form>
    )
  }

  renderEntity (item, isHighlighted) {
    if (typeof item == 'object') {
      // entity
      return (
        <div
          key={item._id}
          id={item._id}
          className={item._id.split(':')[1]}
        >{item.name || Object.keys(item.facts.out).map(r => r + ' => ' + item.facts.out[r]).join('; ')}</div>
      )
    } else {
      // string or number
      return (
        <div key={item}>{item}</div>
      )
    }
  }

  getItemValue (item) {
    return typeof item == 'object' ? item._id : item
  }

  shouldEntityRender (item, typed) {
    let tempItem = {_id: item._id}
    for (var k in item.out) {
      tempItem[k] = item.out[k]
    }
    let s = new Sifter([item.out])
    let res = s.search(typed, { fields: Object.keys(tempItem) })[0]
    if (res && res.score > 0.2) {
      return true
    }
  }
}

Adder.propTypes = {
  entitiesById: PropTypes.objectOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    _rev: PropTypes.string,
    in: PropTypes.object,
    out: PropTypes.object,
    name: PropTypes.string,
    kind: PropTypes.string
  })),
  entities: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    _rev: PropTypes.string,
    in: PropTypes.object,
    out: PropTypes.object,
    name: PropTypes.string,
    kind: PropTypes.string
  })),
  predicates: PropTypes.arrayOf(PropTypes.string)
}

const selector = createSelector(
  entitiesByIdSelector,
  entitiesListSelector,
  predicatesSelector,
  suggestionsSelector,
  (entitiesById, entities, predicates, suggestions) => {
    return {
      entitiesById,
      entities,
      predicates,
      suggestions
    }
  }
)

export default connect(selector)(Adder)
