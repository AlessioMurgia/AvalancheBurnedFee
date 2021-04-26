const fastify = require('fastify')()
const resolve = require('path').resolve
const { MongoClient } = require('mongodb')
const redis = require("redis");
const path = require('path')
const aggregation = require('./functions/aggregation')

const uri = 'mongodb+srv://alessio:passwordprova12@avax.zjxwn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
const clientRedis = redis.createClient();


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
  const database = client.db('BlocksDB')
  const blocks_db = database.collection('blocks')
  const balance_db = database.collection('totalBalances')

  const total_balance = await balance_db.findOne({}, { sort: { _id: -1 }, limit: 1 })
  const block_list = await blocks_db.find({}).sort({ _id: -1 }).limit(5).toArray()

  return reply.view('index.ejs', { blocks: block_list, totalburned: total_balance })
})

fastify.get('/aggregation', async (req, reply) => {
  let last24h = await aggregation.aggregateLastHour();
  let last4w = await aggregation.aggregate30Days();
  let lastDay = 0;
  let total30d = 0;

  await last4w.forEach(element => total30d = total30d + element['total']);
  await last24h.forEach(element => lastDay = lastDay + element['total']);

  await clientRedis.set('last_h', last24h[0]['total']);
  await clientRedis.set('last_d', lastDay);
  await clientRedis.set('last_w', last4w[0]['total']);
  await clientRedis.set('last_4w', total30d);

  await clientRedis.mget(['last_h', 'last_d', 'last_w', 'last_4w'], (err, data)=>{
    if(err){
      throw err;
    }
    return reply.view('aggregation.ejs', { last_h: data[0], last_d: data[1], last_w: data[2], last_4w: data[3]})
  });
})


client.connect(function () {
  console.log('connected to mongo')
  fastify.listen(3000, err => {
    if (err) throw err
    console.log(`server listening on ${fastify.server.address().port}`)
  })
  clientRedis.on("error", function (error) {
    console.error(error);
  });
})
