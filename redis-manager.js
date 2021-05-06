const redis = require('redis')
// const aggregation = require('./functions/aggregation')
// const dbHandler = require('./functions/db-handler')

const clientRedis = redis.createClient()

clientRedis.on('error', function (error) {
  console.error(error)
})

async function redisSetHour (year, month, day, hour, burned) {
  try {
    // const lastHourAggregation = await dbHandler.lastInsertedItems('hours', 1)
    const insertionStringHours = 'hour:' + year + '-' + month + '-' + day + '-' + hour
    // inserting string hour:year-month-day-hour
    await clientRedis.set(insertionStringHours, burned)
  } catch (e) {
    console.log(e)
  }
}
async function redisSetDay (year, month, day, burned) {
  try {
    // const lastHourAggregation = await dbHandler.lastInsertedItems('hours', 1)
    const insertionStringHours = 'hour:' + year + '-' + month + '-' + day
    // inserting string hour:year-month-day-hour
    await clientRedis.set(insertionStringHours, burned)
  } catch (e) {
    console.log(e)
  }
}
/*
async function redisSetWeek (year, month, day, burned) {
  try {
    //const lastHourAggregation = await dbHandler.lastInsertedItems('hours', 1)
    const insertionStringHours = 'hour:' + year + '-' +month + '-'+day+'-'
    //inserting string hour:year-month-day-hour
    await clientRedis.set(insertionStringHours, burned);
  } catch (e) {
    console.log(e)
  }
} */
async function redisSetMonth (year, month, burned) {
  try {
    // const lastHourAggregation = await dbHandler.lastInsertedItems('hours', 1)
    const insertionStringHours = 'hour:' + year + '-' + month
    // inserting string hour:year-month-day-hour
    await clientRedis.set(insertionStringHours, burned)
  } catch (e) {
    console.log(e)
  }
}

async function redisGetHour () {
  const date = new Date()
  date.setHours(date.getHours() - 2)
  return new Promise((resolve) => {
    clientRedis.get('hour:' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getHours(), (err, reply) => {
      resolve(reply)
    })
  })
}

async function redisGetDay () {
  const date = new Date()
  return new Promise((resolve) => {
    clientRedis.get('hour:' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(), (err, reply) => {
      resolve(reply)
    })
  })
}
async function redisGetMonth () {
  const date = new Date()
  return new Promise((resolve) => {
    clientRedis.get('hour:' + date.getFullYear() + '-' + (date.getMonth() + 1), (err, reply) => {
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
