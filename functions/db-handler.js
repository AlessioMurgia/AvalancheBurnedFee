const { MongoClient } = require('mongodb')
const connectionString = require('../connection-string')

// define client mongodb
const client = new MongoClient(connectionString.uri, { useNewUrlParser: true, useUnifiedTopology: true })

// insert block in db function
async function insertBlock (block) {
  try {
    // Connect to the MongoDB cluster
    if (!client.isConnected()) { await client.connect() }

    const database = client.db('BlocksDB')
    const blocksDb = database.collection('blocks')
    // noinspection JSUnresolvedVariable
    await blocksDb.insertOne({ block: block, decimalGasUsed: parseInt(block.gasUsed, 16), createdAt: new Date(Date.now()) })
  } catch (e) {
    console.error(e)
  }
}

async function insertBalance (totalBalance, lastBlock) {
  try {
    // Connect to the MongoDB cluster
    if (!client.isConnected()) { await client.connect() }

    const database = client.db('BlocksDB')
    const balanceDb = database.collection('totalBalances')
    await balanceDb.insertOne({ _id: lastBlock, balance: totalBalance })
  } catch (e) {
    console.error(e)
  }
}

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
exports.insertBalance = insertBalance
exports.lastInsertedItems = lastInsertedItems
