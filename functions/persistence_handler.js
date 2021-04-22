const {MongoClient} = require('mongodb');

//define uri mongodb cluster
const uri = "mongodb+srv://alessio:passwordprova12@avax.zjxwn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

//define client mongodb
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let oncepersistence = false;


//persistence updater
async function UpdatePersistence(persistence_db, lBlock){
    try{
        if(!client.isConnected()){await client.connect()}

        const filter = {starts: null};
        const update = { $set: {stops: parseInt(lBlock, 16)}};
        await persistence_db.updateOne(filter, update);
    }
    catch (e)
    {
        console.error(e);
    }
}

//persistence manager
async function PersistenceManager(fBlock, lBlock){
    try{
        if(!client.isConnected()){await client.connect()}

        const database = client.db('BlocksDB');
        const persistence_db = database.collection('persistencebootstrap');

        if(await persistence_db.countDocuments() === 0){
            oncepersistence = true;
            await persistence_db.insertOne({starts: parseInt(fBlock, 16), stops: 0});
            await persistence_db.insertOne({starts: null, stops: parseInt(lBlock, 16)});
        }
        else {
            if(!oncepersistence) {
                oncepersistence = true;
                const filter = {starts: null};
                const update = {$set: {starts: parseInt(fBlock, 16)}};
                await persistence_db.updateOne(filter, update);
                await persistence_db.insertOne({starts: null, stops:parseInt(lBlock, 16)});
            }
            else {
                await UpdatePersistence(persistence_db, lBlock);
            }
        }
    }
    catch (e) {
        console.error(e);
    }
}

exports.PersistenceManager = PersistenceManager;