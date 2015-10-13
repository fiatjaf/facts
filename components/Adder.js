import React, { Component, PropTypes } from 'react'
import Autocomplete from 'react-autocomplete'
import immupdate from 'immupdate'
import { factsDB } from '../pouch'
import { createSelector } from 'reselect'
import { entitiesByIdSelector, entitiesSelector, predicatesSelector } from '../selectors'
import { addFact } from '../actions'
import { connect } from 'react-redux'

class Adder extends Component {
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSelect = this.handleSelect.bind(this)

    const { entities, predicates } = this.props
    this.state = {
      suggestions: {
        subject: entities,
        predicate: predicates,
        object: entities
      },
      triple: {
        subject: '',
        predicate: '',
        object: '',
      }
    }
  }

  handleSubmit (e) {
    e.preventDefault()

    this.add({
      subject: this.state.triple.subject,
      predicate: this.state.triple.predicate,
      object: this.state.triple.object
    })
  }

  handleSelect (value, item) {
    // update value being typed
    let update = {}
    update[name] = e.target.value
    this.setState(immupdate(this.state, { triple: update }))
  }

  handleChange (name, e, value) {
    const { subject, predicate, object } = this.state.triple
    const { entities, predicates, entitiesById } = this.props

    // update value being typed
    let update = {}
    update[name] = e.target.value

    // getting suggestions from factsDB
    let tuple = {
      'subject': ['_', predicate || null, object || null],
      'predicate': [subject || null, '_', object || null],
      'object': [subject || null, predicate || null, '_']
    }[name]

    this.getSuggestions(tuple).then(ss=> {
      let suggestions = name == 'predicate' ?
                        ss.concat(predicates) :
                        ss.map(s => entitiesById[s._id] || s).concat(entities)
      this.setState(immupdate(this.state, {
        suggestions: {
          [name]: suggestions
        },
        triple: update,
      }))
    })
    .catch(err => {
      console.log('error on getSuggestions(', tuple ,'):', err)
      this.setState(immupdate(this.state, { triple: update }))
    })
  }

  add(triple) {
    const { dispatch } = this.props

    dispatch(addFact(triple))
  }

  render() {
    const { subject, predicate, object } = this.state.suggestions

    return (
      <form onSubmit={this.handleSubmit}>
        <Autocomplete
          onChange={this.handleChange.bind(this, 'subject')}
          onSelect={this.handleSelect.bind(this, 'subject')}
          items={subject}
          getItemValue={this.getItemValue}
          renderItem={this.renderEntity}
        />
        <Autocomplete
          onChange={this.handleChange.bind(this, 'predicate')}
          onSelect={this.handleSelect.bind(this, 'predicate')}
          items={predicate}
          getItemValue={this.getItemValue}
          renderItem={this.renderEntity}
        />
        <Autocomplete
          onChange={this.handleChange.bind(this, 'object')}
          onSelect={this.handleSelect.bind(this, 'object')}
          items={object}
          getItemValue={this.getItemValue}
          renderItem={this.renderEntity}
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
        >{item.name || Object.keys(item.out).map(r => r + ' => ' + item[r]).join('; ')}</div>
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

  getSuggestions (tuple) {
    return factsDB.query('facts/suggest', {
      reduce: false,
      startkey: tuple,
      endkey: [...tuple, {}]
    })
    .then(res => res.rows.map(row => row.value))
  }
}

Adder.propTypes = {
  entitiesById: PropTypes.objectOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    _rev: PropTypes.string,
    in: PropTypes.object,
    out: PropTypes.object,
    name: PropTypes.string
  })),
  entities: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    _rev: PropTypes.string,
    in: PropTypes.object,
    out: PropTypes.object,
    name: PropTypes.string
  })),
  predicates: PropTypes.arrayOf(PropTypes.string)
}

const selector = createSelector(
  entitiesByIdSelector,
  entitiesSelector,
  predicatesSelector,
  (entitiesById, entities, predicates) => {
    return {
      entitiesById,
      entities,
      predicates,
    }
  }
)

export default connect(selector)(Adder)
