const fetchHandler = require('./functions/fetch-handler')
const dbHandler = require('./functions/db-handler')
const persistenceHandler = require('./functions/persistence-handler')
// const aggregationHandler = require('./functions/aggregation')

// last block gathered
let lastBlockGathered
let lastBlockGathered2

// first block gathered
let firstBlockGathered

// write first block only once
let once2 = false

// main function
const liveStreamBlockFunc = async () => {
  try {
    // awaiting previous responses
    const lastBlock = await fetchHandler.fetchBlock()
    const totalBalance = await fetchHandler.fetchTotalFeeBurned()

    if (!once2) {
      firstBlockGathered = lastBlock
      once2 = true
    }

    // new blocks filter
    if (lastBlockGathered !== lastBlock && lastBlockGathered2 !== lastBlock) {
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
      await dbHandler.insertBlock(blockDescription)

      // insert in mongodb
      await dbHandler.insertBalance(totalBalance, lastBlockGathered)
    }
  } catch (ignore) {
    console.log('error func')
  } finally {
    // setTimeout(() => liveStreamBlockFunc(), 0)
    await liveStreamBlockFunc()
  }
}

liveStreamBlockFunc()
