const fetch = require("node-fetch");
const myHeaders = new fetch.Headers();
const {MongoClient} = require('mongodb');

//headers list
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Cookie", "__cfduid=dc54cddb51676178e2e860c64b93b8b0d1616974601; AWSALB=4xaiktDhKcfAT6Fhfx1ruQQHaOvcxnlH8PSFo6W+uoqHuMzgBVixw98DgaQrqfeLqicIzfvaQ33D7jdJMdySdM6JyF+H/amnLKMkzJMeM+9jJxAx70My0CUVdIDX; AWSALBCORS=4xaiktDhKcfAT6Fhfx1ruQQHaOvcxnlH8PSFo6W+uoqHuMzgBVixw98DgaQrqfeLqicIzfvaQ33D7jdJMdySdM6JyF+H/amnLKMkzJMeM+9jJxAx70My0CUVdIDX");

//last block gathered
let LastBlockGathered;

//mongodb only one client connection
var once = false;

//define uri mongodb cluster
const uri = "mongodb+srv://alessio:passwordprova12@avax.zjxwn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

//define client mongodb
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//insert block in db function
async function InsertBlock(block){
    try {
        // Connect to the MongoDB cluster
        const database = client.db('BlocksDB');
        const blocks_db = database.collection('blocks');
        await blocks_db.insertOne(block)

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

//routing function
async function LiveStreamBlockFunc() {

    if(!once)
    {
        await client.connect();
        once = true;
    }

    //raw var body
    const RawLastBlockNumber = JSON.stringify({"jsonrpc": "2.0", "method": "eth_blockNumber", "params": [], "id": 1});
    const rawGetTotalBalance = JSON.stringify({
        "jsonrpc": "2.0",
        "method": "eth_getBalance",
        "params": ["0x0100000000000000000000000000000000000000", "latest"],
        "id": 1
    });

    //request block height
    const RequestOptionsLastBlockNumber = {
        method: 'POST',
        headers: myHeaders,
        body: RawLastBlockNumber,
        redirect: 'follow'
    };
    //request for total balance
    const requestOptionsTotalBalance = {
        method: 'POST',
        headers: myHeaders,
        body: rawGetTotalBalance,
        redirect: 'follow'
    };

    //fetching last block
    async function fetchBlock(options){
        try {

            const response = await fetch("https://api.avax.network/ext/bc/C/rpc", options);
            return await response.json();
        } catch (error) {
            console.error(error);
        }

    }

    //last block call function
    async function LastBlockNumber(options) {
        const nBlocco = await fetchBlock(options);
        return nBlocco.result;

    }

    //fetching total fee burned
    async function fetchTotalFeeBurned(options){
        try {
            const response = await fetch("https://api.avax.network/ext/bc/C/rpc", options);
            return await response.json();
        } catch (error) {
            console.error(error);
        }
    }

    //total fee burned call function
    async function TotalFeeBurned(options) {
        const totalBalance = await fetchTotalFeeBurned(options);
        return totalBalance.result;
    }

    //awaiting previous responses
    const last_block = await LastBlockNumber(RequestOptionsLastBlockNumber);
    const total_balance = await TotalFeeBurned(requestOptionsTotalBalance);

    //new blocks filter
    if(LastBlockGathered !== last_block)
    {
        LastBlockGathered = last_block;
        console.log(" ");
        console.log("Block height: " + parseInt(last_block, 16));

        //raw body fee burned per block
        var RawFeeBurnedPerBlock = JSON.stringify({
            "jsonrpc": "2.0",
            "method": "eth_getBlockByNumber",
            "params": [last_block, true],
            "id": 1
        });

        //var for request fee burned per block
        var RequestOptionsFeeBurnedPerBlock = {
            method: 'POST',
            headers: myHeaders,
            body: RawFeeBurnedPerBlock,
            redirect: 'follow'
        };

        //fee burned per block fetch
        async function fetchFeeBurnedPerBlock(options) {
            try {
                const response = await fetch("https://api.avax.network/ext/bc/C/rpc", options);
                return await response.json();
            } catch (error) {
                console.error(error);
            }
        }

        //fee burned per block function
        async function FeeBurnedPerBlock(options) {
            const blockDescription = await fetchFeeBurnedPerBlock(options);
            await InsertBlock(blockDescription);
            return blockDescription.result;
        }


        //Fee burned per block call
        await (async () => {
            const gas_used = await FeeBurnedPerBlock(RequestOptionsFeeBurnedPerBlock);
            console.log("Burned fee: " + parseInt(gas_used.gasUsed) * 0.00000047 * 0.001 + " Avax");
        })();

        //total fee burned
        InsertBalance(total_balance, LastBlockGathered).then(()=> console.log("Total burned: " + parseInt(total_balance, 16)*10**-9*0.00000000047 + " Avax"));
    }
    else {}

    //set timer routine
    setTimeout(function() { LiveStreamBlockFunc(); }, 500);
}

LiveStreamBlockFunc();
