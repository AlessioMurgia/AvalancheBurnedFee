const fetchHandler = require('./functions/fetch-handler')
const dbHandler = require('./functions/db-handler')
const persistenceHandler = require('./functions/persistence-handler')
const redisServer = require('./redis-manager')

// last block gathered
let lastBlockGathered

// first block gathered
let firstBlockGathered

// write first block only once
let once2 = false

// main function
async function liveStreamBlockFunc () {
  // awaiting previous responses
  const lastBlock = await fetchHandler.fetchBlock()
  const totalBalance = await fetchHandler.fetchTotalFeeBurned()

  if (!once2) {
    firstBlockGathered = lastBlock
    once2 = true
  }

  // new blocks filter
  if (lastBlockGathered !== lastBlock) {
    lastBlockGathered = lastBlock
    console.log(' ')
    console.log('Block height: ' + parseInt(lastBlock, 16))

    // call persistence manager
    await persistenceHandler.persistenceManager(firstBlockGathered, lastBlockGathered)

    // Fee burned per block call
    const blockDescription = await fetchHandler.fetchFeeBurnedPerBlock(lastBlockGathered)

    // Insert Block with the description
    await dbHandler.insertBlock(blockDescription)

    // noinspection JSUnresolvedVariable
    console.log('Burned fee: ' + parseInt(blockDescription.gasUsed) * 0.000000225 + ' Avax')

    // insert in mongodb
    await dbHandler.insertBalance(totalBalance, lastBlockGathered).then(() => console.log('Total burned: ' + parseInt(totalBalance, 16) * 10 ** -18 + ' Avax'))

    await redisServer.redis_manager()
  }

  // set timer routine
  setTimeout(() => liveStreamBlockFunc(), 200)
}

liveStreamBlockFunc().catch(e => console.log(e))
