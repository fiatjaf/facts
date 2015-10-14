import PouchDB from 'pouchdb'
import Promise from 'lie'
window.PouchDB = PouchDB

// main database of factsDB
export const factsDB = new PouchDB('facts:facts')

// initial replication, updates design docs
factsDB.replicate.from('https://fiatjaf.smileupps.com/facts')

// creating derived database of entitiesDB
export const entitiesDB = new PouchDB('facts:entities')

let currentSeq = localStorage.getItem('factsDB.changes.seq')
console.log('entitiesDB listening factsDB, currentSeq:', currentSeq)
Promise.resolve().then(() => {
  factsDB.changes({ /* when the factsDB change I change my mind, sir, don't you? */
    include_docs: true,
    style: 'all_docs',
    since: currentSeq
  })
  .on('change', (change) => {
    console.log('got change from factsDB for entitiesDB:', change)
  
    let updates = []
    let fact = change.doc
    if (fact._id.slice(0, 8) == '_design/') { return }
    if (fact._rev.split('-')[0] == '1') {
        // new fact: add it to your entities
        updates.push(computeEntity(fact.triple[0]))
        updates.push(computeEntity(fact.triple[2]))
        // (temporarily recompute)
    } else {
        // facts were deleted or changed: recompute entities
        if (fact.triple && fact.triple.length == 3) {
          updates.push(computeEntity(fact.triple[0]))
          updates.push(computeEntity(fact.triple[2]))
        }
    }

    Promise.all(updates).then(() => {
      localStorage.setItem('factsDB.changes.seq', change.seq)
    })
  })
  .on('error', (err) => {
    console.log('error when listening changes from factsDB for entitiesDB:', err)
  })
})

const computeEntity = function (entityId) {
  if (typeof entityId == 'number' || typeof entityId == 'string' && entityId[0] != ':') {
    // not a real entity, this is a number or a string
    return Promise.resolve()
  }

  return Promise.resolve().then(() => {
    return entitiesDB.get(entityId)
  }).then(doc => {
    return doc
  }).catch(err => {
    if (err.status == 404) {
      return {
        _id: entityId,
        kind: entityId.split(':')[1]
      }
    } else {
      throw err
    }
  }).then((entity) => {
    console.log('will fetch facts for entity', entity)
    return Promise.all([
      factsDB.query('facts/entities', {
        reduce: false,
        startkey: [entityId],
        endkey: [entityId, {}]
      })
    , entity
    ])
  })
  .then((bundle) => {
    let [res, entity] = bundle
    console.log('got facts for', entity, ':', res)

    if (res.rows.length == 0) {
      // no facts, we should delete this entity
      return entitiesDB.remove(entity).catch(() => true)
    }

    let entityFacts = {out: {}, in: {}}
    res.rows.forEach(row => {
      console.log('row:', row)
      let base = row.key[2] ? entityFacts.in : entityFacts.out
      base[row.key[1]] = base[row.key[1]] || []
      base[row.key[1]].push(row.value)
      console.log('base:', base)
    })

    console.log('entityFacts:', entityFacts)
    entity.facts = entityFacts
    return entitiesDB.put(entity)
  })
  .catch(err => {
    console.log('error on computeEntity for entity ' + entityId + ':', err)
    throw err
  })
}
