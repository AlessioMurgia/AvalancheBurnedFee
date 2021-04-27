const fetch_handler = require('./functions/fetch_handler')
const db_handler = require('./functions/db_handler')
const persistence_handler = require('./functions/persistence_handler')
const redis_server = require('./redis_manager')

// last block gathered
let LastBlockGathered

// first block gathered
let FirstBlockGathered

// write first block only once
let once2 = false

//////////////////////////////// routine function /////////////////////////////////////
async function LiveStreamBlockFunc () {
  // awaiting previous responses
  const last_block = await fetch_handler.fetchBlock()
  const total_balance = await fetch_handler.fetchTotalFeeBurned()

  if (!once2) {
    FirstBlockGathered = last_block
    once2 = true
  }

  // new blocks filter
  if (LastBlockGathered !== last_block) {
    LastBlockGathered = last_block
    console.log(' ')
    console.log('Block height: ' + parseInt(last_block, 16))

    // call persistence manager
    await persistence_handler.PersistenceManager(FirstBlockGathered, LastBlockGathered)

    // Fee burned per block call
    const block_description = await fetch_handler.fetchFeeBurnedPerBlock(LastBlockGathered)

    // Insert Block with the description
    await db_handler.InsertBlock(block_description)

    // noinspection JSUnresolvedVariable
    console.log('Burned fee: ' + parseInt(block_description.gasUsed) * 0.000000225 + ' Avax')

    // insert in mongodb
    await db_handler.InsertBalance(total_balance, LastBlockGathered).then(() => console.log('Total burned: ' + parseInt(total_balance, 16) * 10 ** -18 + ' Avax'))

    await redis_server.redis_manager();

  } else {}

  // set timer routine
  setTimeout(() => LiveStreamBlockFunc(), 200)
}

LiveStreamBlockFunc().catch(e => console.log(e))
