import PouchDB from 'pouchdb'
window.PouchDB = PouchDB

// main database of factsDB
export const factsDB = new PouchDB('facts:facts')

// initial replication, updates design docs
factsDB.replicate.from('https://fiatjaf.smileupps.com/facts')

// creating derived database of entitiesDB
export const entitiesDB = new PouchDB('facts:entities')

let currentSeq = 0
factsDB.get('_local/entitiesDB.changes.seq').then(function (d) {
  currentSeq = d.seq
  factsDB.changes({ /* when the factsDB change I change my mind, sir, don't you? */
    include_docs: true,
    style: 'all_docs',
    since: currentSeq
  }).on('change', function (change) {
    console.log('got change from factsDB for entitiesDB:', change)

    let fact = change.doc
    if (fact._id.slice(0, 8) == '_design/') { return }
    if (fact._rev.split('-')[0] == '1') {
        // new fact: add it to your entities
        computeEntity(fact.triple[0])
        computeEntity(fact.triple[2])
        // (temporarily recompute)
    } else {
        // facts were deleted or changed: recompute entities
        if (fact.triple && fact.triple.length == 3) {
          computeEntity(fact.triple[0])
          computeEntity(fact.triple[2])
        }
    }
  }).on('error', function (err) {
    console.log('error when listening changes from factsDB for entitiesDB:', err)
  })
})

const computeEntity = function (entityId) {
  if (typeof entityId == 'number' || typeof entityId == 'string' && entityId[0] != ':') {
    // not a real entity, this is a number or a string
    return
  }

  let entity
  entitiesDB.get(entityId).then(function (doc) {
    entity = doc

    factsDB.query('facts/entities', {
      reduce: false,
      startkey: [entityId],
      endkey: [entityId, {}]
    })
  })
  .then((res) => {
    if (res.rows.length == 0) {
      // no facts, we should delete this entity
      return entitiesDB.remove(entity)
    }

    let entityFacts = {out: {}, in: {}}
    res.rows.forEach(function (row) {
      let base = row.key[2] ? entityFacts.in : entityFacts.out
      base[row.key[1]] = base[row.key[1]] || []
      base[row.key[1]].push(row.value)
    })

    entity.facts = entityFacts
    return entitiesDB.put(entity)
  })
  .catch(console.log.bind(console, 'error on computeEntity for entity ' + entityId + ':'))
}
