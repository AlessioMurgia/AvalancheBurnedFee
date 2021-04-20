const fastify = require('fastify')()
const resolve = require('path').resolve
const {MongoClient} = require('mongodb');
const path = require('path');

const uri = "mongodb+srv://alessio:passwordprova12@avax.zjxwn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

fastify.register(require('point-of-view'), {
    engine: {
        ejs: require('ejs')
    },
    //root: path.join(__dirname, '/templates'),
    templates: 'templates',
    options: {filename: resolve('templates')}
}).register(require('fastify-static'), {
    root: path.join(__dirname, 'templates'),
    prefix: '/templates/',
})

fastify.get('/', async (req, reply) => {
    const database = client.db('BlocksDB');
    const blocks_db = database.collection('blocks');
    const balance_db = database.collection('totalBalances');

    let total_balance = await balance_db.findOne({}, {sort: {_id: -1}, limit: 1 });
    let block_list = await blocks_db.find({}).sort({_id:-1}).limit(5).toArray();

    return reply.view('index.ejs', {blocks: block_list, totalburned: total_balance});
})

client.connect(function () {
    console.log('connected to mongo');
    fastify.listen(3000, err => {
        if (err) throw err
        console.log(`server listening on ${fastify.server.address().port}`)
    })
})