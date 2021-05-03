const { MongoClient } = require('mongodb')
const connectionString = require('../connection-string')

const client = new MongoClient(connectionString.uri, { useNewUrlParser: true, useUnifiedTopology: true })

async function aggregateLastHour () {
  try {
    if (!client.isConnected()) { await client.connect() }
    const database = client.db('BlocksDB')
    const blocksDb = database.collection('blocks')
    const aggregationDb = database.collection('hours')
    const date = new Date()
    date.setHours(date.getHours() - 1)

    const aggregation = await blocksDb.aggregate([
      {
        $match: {
          createdAt: {
            $gt: date
          }
        }
      },
      {
        $project: {
          _id: 1,
          decimalGasUsed: 1,
          createdAt: 1,
          createdAt_Hours: { $hour: '$createdAt' }
        }
      },
      {
        $group: {
          _id: '$createdAt_Hours',
          total: { $sum: '$decimalGasUsed' }
        }
      },
      {
        $sort: {
          _id: -1
        }
      }]
    ).toArray()
    await aggregationDb.insertOne({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(), hour: aggregation[0]._id, burned: aggregation[0].total })
  } catch (e) {
    console.log(e)
  }
}
// aggregateLastHour().then(()=>client.close())

async function aggregateLastDay () {
  try {
    if (!client.isConnected()) { await client.connect() }
    const database = client.db('BlocksDB')
    const blocksDb = database.collection('blocks')
    const aggregationDb = database.collection('days')
    const date = new Date()
    date.setDate(date.getDate() - 1)

    const aggregation = await blocksDb.aggregate([
      {
        $match: {
          createdAt: {
            $gt: date
          }
        }
      },
      {
        $project: {
          _id: 1,
          decimalGasUsed: 1,
          createdAt: 1,
          createdAt_Hours: { $dayOfMonth: '$createdAt' }
        }
      },
      {
        $group: {
          _id: '$createdAt_Hours',
          total: { $sum: '$decimalGasUsed' }
        }
      },
      {
        $sort: {
          _id: -1
        }
      }]
    ).toArray()
    await aggregationDb.insertOne({ year: date.getFullYear(), month: date.getMonth() + 1, day: aggregation[0]._id, burned: aggregation[0].total })
  } catch (e) {
    console.log(e)
  }
}

// aggregateLastDay().then(()=>client.close())

async function aggregateLastWeek () {
  try {
    if (!client.isConnected()) { await client.connect() }
    const database = client.db('BlocksDB')
    const blocksDb = database.collection('blocks')
    const aggregationDb = database.collection('weeks')
    const date = new Date()
    date.setDate(date.getDate() - 7)

    const aggregation = await blocksDb.aggregate([
      {
        $match: {
          createdAt: {
            $gt: date
          }
        }
      },
      {
        $project: {
          _id: 1,
          decimalGasUsed: 1,
          createdAt: 1,
          createdAt_Hours: { $week: '$createdAt' }
        }
      },
      {
        $group: {
          _id: '$createdAt_Hours',
          total: { $sum: '$decimalGasUsed' }
        }
      },
      {
        $sort: {
          _id: -1
        }
      }]
    ).toArray()
    await aggregationDb.insertOne({ year: date.getFullYear(), month: date.getMonth() + 1, dayOfWeek: aggregation[0]._id, burned: aggregation[0].total })
  } catch (e) {
    console.log(e)
  }
}

async function aggregateLastMonth () {
  try {
    if (!client.isConnected()) { await client.connect() }
    const database = client.db('BlocksDB')
    const blocksDb = database.collection('blocks')
    const aggregationDb = database.collection('months')
    const date = new Date()
    date.setMonth(date.getMonth() - 1)

    const aggregation = await blocksDb.aggregate([
      {
        $match: {
          createdAt: {
            $gt: date
          }
        }
      },
      {
        $project: {
          _id: 1,
          decimalGasUsed: 1,
          createdAt: 1,
          createdAt_Hours: { $month: '$createdAt' }
        }
      },
      {
        $group: {
          _id: '$createdAt_Hours',
          total: { $sum: '$decimalGasUsed' }
        }
      },
      {
        $sort: {
          _id: -1
        }
      }]
    ).toArray()
    await aggregationDb.insertOne({ year: date.getFullYear(), month: aggregation[0]._id, burned: aggregation[0].total })
  } catch (e) {
    console.log(e)
  }
}

exports.aggregateLastHour = aggregateLastHour
exports.aggregateLastDay = aggregateLastDay
exports.aggregateLastWeek = aggregateLastWeek
exports.aggregateLastMonth = aggregateLastMonth
