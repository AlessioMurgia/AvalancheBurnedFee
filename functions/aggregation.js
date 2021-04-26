const { MongoClient } = require('mongodb')

const uri = 'mongodb+srv://alessio:passwordprova12@avax.zjxwn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

async function aggregateLastHour(){
  try {
    if(!client.isConnected()){await client.connect()}
    const database = client.db('BlocksDB')
    const blocks_db = database.collection('blocks')

    let lastHour = new Date();
    lastHour.setHours(lastHour.getHours()-24);

    return await blocks_db.aggregate([
      { $match: {
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
          "createdAt_Hours": { $hour: "$createdAt" }
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
          _id : -1
        }
      }]
    ).toArray();
  }
  catch (e){
    console.log(e);
  }
}

async function aggregate4weeks(){
  try {
    if(!client.isConnected()){await client.connect()}
    const database = client.db('BlocksDB')
    const blocks_db = database.collection('blocks')

    let lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth()-1);

    return await blocks_db.aggregate([
      { $match: {
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
          "createdAt_Hours": { $week: "$createdAt" }
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
          _id : -1
        }
      }]
    ).toArray();
  }
  catch (e){
    console.log(e);
  }
}

exports.aggregateLastHour = aggregateLastHour;
exports.aggregate30Days = aggregate4weeks;
