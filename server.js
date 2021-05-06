const fastify = require('fastify')()
const resolve = require('path').resolve
const path = require('path')
const dbHandler = require('./functions/db-handler')
const redisManager = require('./redis-manager')

fastify.register(require('point-of-view'), {
  engine: {
    ejs: require('ejs')
  },
  templates: 'templates',
  options: { filename: resolve('templates') }
}).register(require('fastify-static'), {
  root: path.join(__dirname, 'templates'),
  prefix: '/templates/'
})

fastify.get('/', async (req, reply) => {
  const totalBalance = await dbHandler.lastInsertedItems('blocks', 1)
  const blockList = await dbHandler.lastInsertedItems('blocks', 5)

  return reply.view('index.ejs', { blocks: blockList, totalBurned: totalBalance })
})

fastify.get('/aggregation', async (req, reply) => {
  const lastHour = await redisManager.redisGetHour()
  const lastDay = await redisManager.redisGetDay()
  const lastMonth = await redisManager.redisGetMonth()
  return reply.view('aggregation.ejs', { last_h: lastHour, last_d: lastDay, last_m: lastMonth })
})

fastify.listen(3000, err => {
  if (err) throw err
  // noinspection JSUnresolvedVariable
  console.log(`server listening on ${fastify.server.address().port}`)
})
