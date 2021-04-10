const fetch = require("node-fetch");
const myHeaders = new fetch.Headers();
const {MongoClient} = require('mongodb');
const fs = require('fs')
const lineReader = require('line-reader');


//headers list
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Cookie", "__cfduid=dc54cddb51676178e2e860c64b93b8b0d1616974601; AWSALB=4xaiktDhKcfAT6Fhfx1ruQQHaOvcxnlH8PSFo6W+uoqHuMzgBVixw98DgaQrqfeLqicIzfvaQ33D7jdJMdySdM6JyF+H/amnLKMkzJMeM+9jJxAx70My0CUVdIDX; AWSALBCORS=4xaiktDhKcfAT6Fhfx1ruQQHaOvcxnlH8PSFo6W+uoqHuMzgBVixw98DgaQrqfeLqicIzfvaQ33D7jdJMdySdM6JyF+H/amnLKMkzJMeM+9jJxAx70My0CUVdIDX");

//last block gathered
let LastBlockGathered;

//first block gathered
var FirstBlockGathered;

//arrays for writing in persistence
var stops = [];
var starts = [];

//working in first iteration only
var oncestart = false;
var oncestop = false;

//write first block only once
var once2 = false;

//mongodb only one client connection
var onceMongo = false;
let i;

//define uri mongodb cluster
const uri = "mongodb+srv://alessio:passwordprova12@avax.zjxwn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

//define client mongodb
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//writefile function
function WriteFile(filename, array){
    for (i = 0; i < array.length; i++) {
        fs.appendFile(filename, array[i] + '\n', (err) => {

            // In case of a error throw err.
            if (err) throw err;
        })
    }
}

//getstops func for persistence
function getstops(lastblock){
    //checking if file is empty
    fs.readFile("Outputstops.txt", (err, file) => {
        if (file.length === 0) {
            oncestop=true;
            stops.push('0',lastblock);
            WriteFile('Outputstops.txt', stops);

        } else {
            if(!oncestop) {
                oncestop = true;
                lineReader.eachLine('Outputstops.txt', function (line) {
                    stops.push(line);
                });
                setTimeout(function () {
                    stops.push(lastblock);
                    fs.unlink('Outputstops.txt', function (err) {
                        if (err) throw err;
                    });
                    WriteFile('Outputstops.txt', stops);
                }, 50);
            }
            else{
                setTimeout(function () {
                    stops[stops.length-1] = lastblock;
                    fs.unlink('Outputstops.txt', function (err) {
                        if (err) throw err;
                    });
                    WriteFile('Outputstops.txt', stops);
                }, 50);
            }
        }
    })
}

//getstart func persistence
function getstarts(firstblock){
    fs.readFile("Outputstarts.txt", (err, file) => {
        if (file.length === 0) {
            oncestart = true;
            starts.push(firstblock);
            WriteFile('Outputstarts.txt', starts);
        } else {
            if(!oncestart) {
                oncestart = true;
                lineReader.eachLine('Outputstarts.txt', function (line) {
                    starts.push(line);
                });
                setTimeout(function () {
                    starts.push(firstblock);
                    fs.unlink('Outputstarts.txt', function (err) {
                        if (err) throw err;
                    });
                    WriteFile('Outputstarts.txt', starts)
                }, 50);
            }
            else{}
        }
    })
}

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

    if(!onceMongo)
    {
        await client.connect();
        onceMongo = true;
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

        getstarts(FirstBlockGathered);

        getstops(LastBlockGathered);


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
    setTimeout(function() { LiveStreamBlockFunc(); }, 400);
}


LiveStreamBlockFunc();