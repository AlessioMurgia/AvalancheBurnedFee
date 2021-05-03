const fastify = require('fastify')()
const resolve = require('path').resolve
//const redis = require('redis')
const path = require('path')
const dbHandler = require('./functions/db-handler')

//const clientRedis = redis.createClient()

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
  const totalBalance = await dbHandler.lastInsertedItems('totalBalances', 1)
  const blockList = await dbHandler.lastInsertedItems('blocks', 5)

  return reply.view('index.ejs', { blocks: blockList, totalBurned: totalBalance })
})

fastify.get('/aggregation', async (req, reply) => {
  // noinspection JSUnresolvedFunction
  await clientRedis.mget(['last_h', 'last_d', 'last_w', 'last_4w'], (err, data) => {
    if (err) {
      throw err
    }
    return reply.view('aggregation.ejs', { last_h: data[0], last_d: data[1], last_w: data[2], last_4w: data[3] })
  })
})

fastify.listen(3000, err => {
  if (err) throw err
  // noinspection JSUnresolvedVariable
  console.log(`server listening on ${fastify.server.address().port}`)
})
//clientRedis.on('error', function (error) {
  //console.error(error)
//})
