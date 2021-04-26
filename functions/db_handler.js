const { MongoClient } = require('mongodb')

// define uri mongodb cluster
const uri = 'mongodb+srv://alessio:passwordprova12@avax.zjxwn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

// define client mongodb
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

// insert block in db function
async function InsertBlock (block) {
  try {
    // Connect to the MongoDB cluster
    if (!client.isConnected()) { await client.connect() }

    const database = client.db('BlocksDB')
    const blocks_db = database.collection('blocks')
    await blocks_db.insertOne({ block: block, decimalGasUsed: parseInt(block.gasUsed, 16), createdAt: new Date(Date.now()) })
  } catch (e) {
    console.error(e)
  }
}

async function InsertBalance (totalbalance, lastblock) {
  try {
    // Connect to the MongoDB cluster
    if (!client.isConnected()) { await client.connect() }

    const database = client.db('BlocksDB')
    const balance_db = database.collection('totalBalances')
    await balance_db.insertOne({ _id: lastblock, balance: totalbalance })
  } catch (e) {
    console.error(e)
  }
}

exports.InsertBlock = InsertBlock
exports.InsertBalance = InsertBalance
