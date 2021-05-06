const fetchHandler = require('./functions/fetch-handler')
const dbHandler = require('./functions/db-handler')
const persistenceHandler = require('./functions/persistence-handler')
const aggregationHandler = require('./functions/aggregation')

// last block gathered
let lastBlockGathered
let lastBlockGathered2
let lastBlockGathered3

// first block gathered
let firstBlockGathered

// write first block only once
let firstStart = false

// main function
const liveStreamBlockFunc = async () => {
  try {
    // awaiting previous responses
    const lastBlock = await fetchHandler.fetchBlock()
    const totalBalance = await fetchHandler.fetchTotalFeeBurned()

    if (!firstStart) {
      firstBlockGathered = lastBlock
      firstStart = true
    }

    // new blocks filter
    if (lastBlockGathered !== lastBlock && lastBlockGathered2 !== lastBlock && lastBlockGathered3 !== lastBlock) {
      lastBlockGathered3 = lastBlockGathered2
      lastBlockGathered2 = lastBlockGathered
      lastBlockGathered = lastBlock
      console.log('Block height: ' + parseInt(lastBlock, 16))

      // call persistence manager
      await persistenceHandler.persistenceManager(firstBlockGathered,
        lastBlockGathered)

      // Fee burned per block call
      const blockDescription = await fetchHandler.fetchFeeBurnedPerBlock(
        lastBlockGathered)

      // Insert Block with the description
      await dbHandler.insertBlock(blockDescription, totalBalance)

      // insert in mongodb
      // await dbHandler.insertBalance(totalBalance, lastBlockGathered)
    }
  } catch (ignore) {
    console.log('error func')
  } finally {
    // setTimeout(() => liveStreamBlockFunc(), 0)
    await liveStreamBlockFunc()
  }
}

liveStreamBlockFunc().catch((e)=>console.log(e))
aggregationHandler.aggregateLastHour().then(() => setInterval(() => aggregationHandler.aggregateLastHour(), 1000 * 60 * 60))
aggregationHandler.aggregateLastDay().then(() => setInterval(() => aggregationHandler.aggregateLastDay(), 1000 * 60 * 60 * 24))
aggregationHandler.aggregateLastMonth().then(() => aggregationHandler.setInterval_(() => aggregationHandler.aggregateLastMonth(), 1000 * 60 * 60 * 24 * 30))