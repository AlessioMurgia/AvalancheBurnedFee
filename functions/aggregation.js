const { MongoClient } = require('mongodb')
const connectionString = require('../connection-string')
const redisManager = require('../redis-manager')

const client = new MongoClient(connectionString.uri, { useNewUrlParser: true, useUnifiedTopology: true })

function setInterval_ (fn, delay) {
  const maxDelay = Math.pow(2, 31) - 1

  if (delay > maxDelay) {
    const args = arguments
    args[1] -= maxDelay

    return setInterval(function () {
      setInterval_.apply(undefined, args)
    }, maxDelay)
  }

  return setTimeout.apply(undefined, arguments)
}

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
          gasUsed: 1,
          createdAt: 1,
          createdAt_Hours: { $hour: '$createdAt' }
        }
      },
      {
        $group: {
          _id: '$createdAt_Hours',
          total: { $sum: '$gasUsed' }
        }
      },
      {
        $sort: {
          _id: -1
        }
      }]
    ).toArray()
    await aggregationDb.insertOne({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(), hour: aggregation[0]._id, burned: aggregation[0].total })
    await redisManager.redisSetHour(date.getFullYear(), date.getMonth() + 1, date.getDate(), aggregation[0]._id, aggregation[0].total)
  } catch (ignore) {
    console.log(ignore)
  }
}

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
          gasUsed: 1,
          createdAt: 1,
          createdAt_Day: { $dayOfMonth: '$createdAt' }
        }
      },
      {
        $group: {
          _id: '$createdAt_Day',
          total: { $sum: '$gasUsed' }
        }
      },
      {
        $sort: {
          _id: -1
        }
      }]
    ).toArray()
    await aggregationDb.insertOne({ year: date.getFullYear(), month: date.getMonth() + 1, day: aggregation[0]._id, burned: aggregation[0].total })
    await redisManager.redisSetDay(date.getFullYear(), date.getMonth() + 1, aggregation[0]._id, aggregation[0].total)
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
          gasUsed: 1,
          createdAt: 1,
          createdAt_Month: { $month: '$createdAt' }
        }
      },
      {
        $group: {
          _id: '$createdAt_Month',
          total: { $sum: '$gasUsed' }
        }
      },
      {
        $sort: {
          _id: -1
        }
      }]
    ).toArray()
    await aggregationDb.insertOne({ year: date.getFullYear(), month: aggregation[0]._id, burned: aggregation[0].total })
    await redisManager.redisSetMonth(date.getFullYear(), aggregation[0]._id, aggregation[0].total)
  } catch (e) {
    console.log(e)
  }
}

exports.aggregateLastHour = aggregateLastHour
exports.aggregateLastDay = aggregateLastDay
exports.aggregateLastMonth = aggregateLastMonth
exports.setInterval_ = setInterval_
