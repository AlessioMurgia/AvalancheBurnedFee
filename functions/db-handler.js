const { MongoClient } = require('mongodb')
const connectionString = require('../connection-string')

// define client mongodb
const client = new MongoClient(connectionString.uri, { useNewUrlParser: true, useUnifiedTopology: true })

// insert block in db function
async function insertBlock (block, totalBalance) {
  try {
    // Connect to the MongoDB cluster
    if (!client.isConnected()) { await client.connect() }

    const database = await client.db('BlocksDB')
    const blocksDb = await database.collection('blocks')
    await blocksDb.insertOne({ height: parseInt(block.number, 16), gasUsed: parseInt(block.gasUsed, 16), totalBurnedUntilNow: totalBalance, createdAt: new Date(Date.now()) })
  } catch (e) {
    console.log(e)
  }
}

// get last inserted items
async function lastInsertedItems (collection, number) {
  try {
    if (!client.isConnected()) { await client.connect() }
    const database = client.db('BlocksDB')
    const itemDb = database.collection(collection)
    return await itemDb.find({}).sort({ _id: -1 }).limit(number).toArray()
  } catch (e) {
    console.log(e)
  }
}

exports.insertBlock = insertBlock
exports.lastInsertedItems = lastInsertedItems
