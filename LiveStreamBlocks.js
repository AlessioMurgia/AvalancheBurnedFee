const fetch = require("node-fetch");
const myHeaders = new fetch.Headers();
const {MongoClient} = require('mongodb');

//headers list
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Cookie", "__cfduid=dc54cddb51676178e2e860c64b93b8b0d1616974601; AWSALB=4xaiktDhKcfAT6Fhfx1ruQQHaOvcxnlH8PSFo6W+uoqHuMzgBVixw98DgaQrqfeLqicIzfvaQ33D7jdJMdySdM6JyF+H/amnLKMkzJMeM+9jJxAx70My0CUVdIDX; AWSALBCORS=4xaiktDhKcfAT6Fhfx1ruQQHaOvcxnlH8PSFo6W+uoqHuMzgBVixw98DgaQrqfeLqicIzfvaQ33D7jdJMdySdM6JyF+H/amnLKMkzJMeM+9jJxAx70My0CUVdIDX");

//last block gathered
let LastBlockGathered;

//first block gathered
let FirstBlockGathered;

//working in first iteration only
let oncepersistence = false;

//write first block only once
let once2 = false;

//define uri mongodb cluster
const uri = "mongodb+srv://alessio:passwordprova12@avax.zjxwn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

//define client mongodb
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//persistence updater
async function UpdatePersistence(persistence_db, lBlock){
    try{
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

//insert block in db function
async function InsertBlock(block){
    try {
        // Connect to the MongoDB cluster
        const database = client.db('BlocksDB');
        const blocks_db = database.collection('blocks');
        await blocks_db.insertOne({block: block.result});

    } catch (e) {
        console.error(e);
    }
}

async function InsertBalance(totalbalance, lastblock){
    try {
        // Connect to the MongoDB cluster
        const database = client.db('BlocksDB');
        const balance_db = database.collection('totalBalances');
        await balance_db.insertOne({ _id: lastblock, balance:totalbalance });

    } catch (e) {
        console.error(e);
    }
}

//fetching last block
async function fetchBlock(){

    //raw var body request
    const RawLastBlockNumber = JSON.stringify({"jsonrpc": "2.0", "method": "eth_blockNumber", "params": [], "id": 1});

    //block height request
    const RequestOptionsLastBlockNumber = {
        method: 'POST',
        headers: myHeaders,
        body: RawLastBlockNumber,
        redirect: 'follow'
    };

    try {
        const response = await fetch("https://api.avax.network/ext/bc/C/rpc", RequestOptionsLastBlockNumber);
        const nBlocco = await response.json();
        return nBlocco.result;
    } catch (error) {
        console.error(error);
    }

}

//fetching total fee burned
async function fetchTotalFeeBurned(){
    //raw total balance burned request body
    const rawGetTotalBalance = JSON.stringify({
        "jsonrpc": "2.0",
        "method": "eth_getBalance",
        "params": ["0x0100000000000000000000000000000000000000", "latest"],
        "id": 1
    });

    //total balance request
    const requestOptionsTotalBalance = {
        method: 'POST',
        headers: myHeaders,
        body: rawGetTotalBalance,
        redirect: 'follow'
    };
    try {
        const response = await fetch("https://api.avax.network/ext/bc/C/rpc", requestOptionsTotalBalance);
        const totalbalance = await response.json();
        return totalbalance.result;
    } catch (error) {
        console.error(error);
    }
}

//fee burned per block fetch
async function fetchFeeBurnedPerBlock() {

    //raw body fee burned per block
    const RawFeeBurnedPerBlock = JSON.stringify({
        "jsonrpc": "2.0",
        "method": "eth_getBlockByNumber",
        "params": [LastBlockGathered, true],
        "id": 1
    });

    //var for request fee burned per block
    const RequestOptionsFeeBurnedPerBlock = {
        method: 'POST',
        headers: myHeaders,
        body: RawFeeBurnedPerBlock,
        redirect: 'follow'
    };

    try {
        const response = await fetch("https://api.avax.network/ext/bc/C/rpc", RequestOptionsFeeBurnedPerBlock);
        const blockDescription = await response.json();
        await InsertBlock(blockDescription);
        return blockDescription.result;
    } catch (error) {
        console.error(error);
    }
}

//////////////////////////////// routine function /////////////////////////////////////
async function LiveStreamBlockFunc() {
    //check if db is connected
    if(!client.isConnected())
    {
        await client.connect();
    }

    //awaiting previous responses
    const last_block = await fetchBlock();
    const total_balance = await fetchTotalFeeBurned();

    if(!once2)
    {
        FirstBlockGathered = last_block;
        once2 = true;
    }

    //new blocks filter
    if(LastBlockGathered !== last_block)
    {
        LastBlockGathered = last_block;
        console.log(" ");
        console.log("Block height: " + parseInt(last_block, 16));

        //call persistence manager
        await PersistenceManager(FirstBlockGathered, LastBlockGathered);

        //Fee burned per block call
        const gas_used = await fetchFeeBurnedPerBlock();

        // noinspection JSUnresolvedVariable
        console.log("Burned fee: " + parseInt(gas_used.gasUsed) * 0.000000225 + " Avax");

        //insert in mongodb
        await InsertBalance(total_balance, LastBlockGathered).then(()=> console.log("Total burned: " + parseInt(total_balance, 16)*10**-18 + " Avax"));
    } else {}

    //set timer routine
    setTimeout(() => LiveStreamBlockFunc(), 200);
}

LiveStreamBlockFunc().catch(e => console.log(e));