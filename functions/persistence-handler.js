const { MongoClient } = require('mongodb')
const connectionString = require('../connection-string')

// define client mongodb
const client = new MongoClient(connectionString.uri, { useNewUrlParser: true, useUnifiedTopology: true })

let oncePersistence = false

// persistence updater
async function updatePersistence (persistenceDb, lBlock) {
  try {
    if (!client.isConnected()) { await client.connect() }

    const filter = { starts: null }
    const update = { $set: { stops: parseInt(lBlock, 16) } }
    await persistenceDb.updateOne(filter, update)
  } catch (e) {
    console.error(e)
  }
}

// persistence manager
async function persistenceManager (fBlock, lBlock) {
  try {
    if (!client.isConnected()) { await client.connect() }

    const database = client.db('BlocksDB')
    const persistenceDb = database.collection('persistencebootstrap')

    if (await persistenceDb.countDocuments() === 0) {
      oncePersistence = true
      await persistenceDb.insertOne({ starts: parseInt(fBlock, 16), stops: 0 })
      await persistenceDb.insertOne({ starts: null, stops: parseInt(lBlock, 16) })
    } else {
      if (!oncePersistence) {
        oncePersistence = true
        const filter = { starts: null }
        const update = { $set: { starts: parseInt(fBlock, 16) } }
        await persistenceDb.updateOne(filter, update)
        await persistenceDb.insertOne({ starts: null, stops: parseInt(lBlock, 16) })
      } else {
        await updatePersistence(persistenceDb, lBlock)
      }
    }
  } catch (e) {
    console.error(e)
  }
}

exports.persistenceManager = persistenceManager
