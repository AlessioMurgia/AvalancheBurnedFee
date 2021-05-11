const redis = require('redis')

// define redis client
const clientRedis = redis.createClient()

// connect to redis server
clientRedis.on('error', function (error) {
  console.error(error)
})

// insert hourly aggregation in redis
async function redisSetHour (year, month, day, hour, burned) {
  try {
    // const lastHourAggregation = await dbHandler.lastInsertedItems('hours', 1)
    const insertionStringHours = year + '-' + month + '-' + day + '-' + hour
    // inserting string year-month-day-hour
    await clientRedis.set(insertionStringHours, burned)
  } catch (e) {
    console.log(e)
  }
}

// insert daily aggregation in redis
async function redisSetDay (year, month, day, burned) {
  try {
    // const lastHourAggregation = await dbHandler.lastInsertedItems('hours', 1)
    const insertionStringHours = year + '-' + month + '-' + day
    // inserting string year-month-day
    await clientRedis.set(insertionStringHours, burned)
  } catch (e) {
    console.log(e)
  }
}

// insert monthly aggregation in redis
async function redisSetMonth (year, month, burned) {
  try {
    // const lastHourAggregation = await dbHandler.lastInsertedItems('hours', 1)
    const insertionStringHours = year + '-' + month
    // inserting string year-month
    await clientRedis.set(insertionStringHours, burned)
  } catch (e) {
    console.log(e)
  }
}

// get hourly aggregation in redis
async function redisGetHour () {
  const date = new Date()
  date.setHours(date.getHours() - 2)

  return new Promise((resolve) => {
    clientRedis.get(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '-' + (date.getHours() - 1), (err, reply) => {
      resolve(reply)
    })
  })
}

// get daily aggregation in redis
async function redisGetDay () {
  const date = new Date()
  return new Promise((resolve) => {
    clientRedis.get(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate() - 1), (err, reply) => {
      resolve(reply)
    })
  })
}

// get monthly aggregation in redis
async function redisGetMonth () {
  const date = new Date()
  return new Promise((resolve) => {
    clientRedis.get(date.getFullYear() + '-' + (date.getMonth()), (err, reply) => {
      resolve(reply)
    })
  })
}

exports.redisSetHour = redisSetHour
exports.redisSetDay = redisSetDay
exports.redisSetMonth = redisSetMonth
exports.redisGetHour = redisGetHour
exports.redisGetDay = redisGetDay
exports.redisGetMonth = redisGetMonth
