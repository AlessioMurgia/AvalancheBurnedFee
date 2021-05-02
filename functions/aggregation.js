const { MongoClient } = require('mongodb')
const connectionString = require('../connection-string')

const client = new MongoClient(connectionString.uri, { useNewUrlParser: true, useUnifiedTopology: true })

async function aggregateLastHour () {
  try {
    if (!client.isConnected()) { await client.connect() }
    const database = client.db('BlocksDB')
    const blocksDb = database.collection('blocks')

    const lastHour = new Date()
    lastHour.setHours(lastHour.getHours() - 24)

    return await blocksDb.aggregate([
      {
        $match: {
          createdAt: {
            $gt: lastHour
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
  } catch (e) {
    console.log(e)
  }
}

async function aggregate4Weeks () {
  try {
    if (!client.isConnected()) { await client.connect() }
    const database = client.db('BlocksDB')
    const blocksDb = database.collection('blocks')

    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    return await blocksDb.aggregate([
      {
        $match: {
          createdAt: {
            $gt: lastMonth
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
  } catch (e) {
    console.log(e)
  }
}

exports.aggregateLastHour = aggregateLastHour
exports.aggregate30Days = aggregate4Weeks
