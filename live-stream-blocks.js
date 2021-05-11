const fetchHandler = require('./functions/fetch-handler')
const dbHandler = require('./functions/db-handler')
const persistenceHandler = require('./functions/persistence-handler')
const aggregationHandler = require('./functions/aggregation')

// last block gathered
let lastBlockGathered

// initialize last block data
let blockDescription

// first block gathered
let firstBlockGathered

// total gas burned
let totalBalance

// first start
let firstStart = false

// main function
const liveStreamBlockFunc = async () => {
  try {
    // only in first start
    if (!firstStart) {
      // fetch functions
      const firstBlock = await fetchHandler.fetchBlock()
      totalBalance = await fetchHandler.fetchTotalFeeBurned()
      blockDescription = await fetchHandler.fetchFeeBurnedPerBlock(firstBlock)

      // DB routine
      await persistenceHandler.persistenceManager(firstBlock, firstBlock)
      await dbHandler.insertBlock(blockDescription, totalBalance)

      // start aggregation routine
      setInterval(() => aggregationHandler.aggregateLastHour(), 1000 * 60 * 60)
      setInterval(() => aggregationHandler.aggregateLastDay(), 1000 * 60 * 60 * 24)
      aggregationHandler.setInterval_(() => aggregationHandler.aggregateLastMonth(), 1000 * 60 * 60 * 24 * 30)

      firstBlockGathered = firstBlock
      lastBlockGathered = firstBlock
      firstStart = true
    } else {
      // set undefined block description
      blockDescription = undefined

      // get last blocks in a iterative way rejecting all the undefined description due to still non-existing block
      while (blockDescription === undefined) {
        blockDescription = await fetchHandler.fetchFeeBurnedPerBlock(
          '0x' + (parseInt(lastBlockGathered, 16) + 1).toString(16))
      }

      // redefine the last block gathered number
      lastBlockGathered = blockDescription.number

      // fetch functions
      totalBalance = await fetchHandler.fetchTotalFeeBurned()

      // DB routine
      await persistenceHandler.persistenceManager(firstBlockGathered, lastBlockGathered)
      await dbHandler.insertBlock(blockDescription, totalBalance)
    }
  } catch (e) {
    console.log(e)
  } finally {
    await liveStreamBlockFunc()
  }
}

liveStreamBlockFunc().catch((e) => console.log(e))
