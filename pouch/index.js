import PouchDB from 'pouchdb'

window.PouchDB = PouchDB
const pouch = new PouchDB('facts')

// initial replication, updates design docs
pouch.replicate.from('https://fiatjaf.smileupps.com/facts')

export default pouch
