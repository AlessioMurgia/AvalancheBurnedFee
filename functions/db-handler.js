const { MongoClient } = require('mongodb')
const connectionString = require('../connection-string')
const fetchHandler = require('./fetch-handler')

// define client mongodb
const client = new MongoClient(connectionString.uri, { useNewUrlParser: true, useUnifiedTopology: true })

// insert block in db function
async function insertBlock (block, totalBalance) {
  try {
    // Connect to the MongoDB cluster
    if (!client.isConnected()) { await client.connect() }

    const database = await client.db('BlocksDB')
    const blocksDb = await database.collection('blocks')
    // const balanceDb = database.collection('totalBalances')

    await blocksDb.insertOne({ height: parseInt(block.number, 16), gasUsed: parseInt(block.gasUsed, 16), totalBurnedUntilNow: totalBalance, createdAt: new Date(Date.now()) })
    // await balanceDb.insertOne({ blockNumber: block.number, balance: totalBalance })
  } catch (ignore) {
    console.log('error DB')
    const retryBlock = await fetchHandler.fetchBlock()
    const descriptionRetry = await fetchHandler.fetchFeeBurnedPerBlock(retryBlock)
    const totalBalanceRetry = await fetchHandler.fetchTotalFeeBurned()
    await insertBlock(descriptionRetry, totalBalanceRetry)
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
/*
async function blockRecover(){
  if (!client.isConnected()) { await client.connect() }
  const database = client.db('BlocksDB')
  const itemDb = database.collection('blocks')
  let blockList = await itemDb.find({}).sort({ _id: -1 }).limit(10).toArray()
  let i;
  //console.log(blockList)
  for(i=0; i<blockList.length-1; i++)
  {
    console.log(blockList[i].height)
    if(blockList[i].height-1 !== blockList[i+1].height)
    {
      let blockNum = await fetchHandler.fetchFeeBurnedPerBlock('0x' + (blockList[i].height-1).toString(16))
      let totalbal = await fetchHandler.fetchTotalFeeBurned()
      await insertBlock(blockNum, totalbal)
      console.log('inserted block')
    }

    /*if(blockList[i-1].height !== blockList[i].height-1)
    {
      let blockNum = await fetchHandler.fetchFeeBurnedPerBlock('0x' + (blockList[i].height-1).toString(16))
      let totalbal = await fetchHandler.fetchTotalFeeBurned()
      await insertBlock(blockNum, totalbal)
      console.log('inserted block')
    }

  }
}

 */

exports.insertBlock = insertBlock
// exports.insertBalance = insertBalance
exports.lastInsertedItems = lastInsertedItems
