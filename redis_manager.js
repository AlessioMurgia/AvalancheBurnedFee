const redis = require("redis");
const aggregation = require('./functions/aggregation')

const clientRedis = redis.createClient();

async function redis_manager() {
  try {
    await clientRedis.flushdb(function (err, succeeded) {
      console.log(succeeded);
    });

    let last24h = await aggregation.aggregateLastHour();
    let last4w = await aggregation.aggregate30Days();
    let lastDay = 0;
    let total30d = 0;

    await last4w.forEach(element => total30d = total30d + element['total']);
    await last24h.forEach(element => lastDay = lastDay + element['total']);

    await clientRedis.set('last_h', last24h[0]['total'], redis.print);
    await clientRedis.set('last_d', lastDay, redis.print);
    await clientRedis.set('last_w', last4w[0]['total'], redis.print);
    await clientRedis.set('last_4w', total30d, redis.print);
  }
  catch (e) {
    console.log(e);
  }
}

exports.redis_manager = redis_manager;