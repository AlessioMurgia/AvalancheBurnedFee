const fetch = require('node-fetch')
const myHeaders = new fetch.Headers()

// headers list
myHeaders.append('Content-Type', 'application/json')
myHeaders.append('Cookie', '__cfduid=d08342a4c282ced3bbf42cd7ad23290221620065613; AWSALB=G7M+Y4eeDq1ThziE+TpqcFeUZKZMt8/Z3EwL9hrBpdx1bZa67p3vw8CIrYcawKvfjQj/o6uO8QihPe4v71RW0VQzQiu6/bgZatES3Co+u3TH6kb8IcUexuAixyoh; AWSALBCORS=G7M+Y4eeDq1ThziE+TpqcFeUZKZMt8/Z3EwL9hrBpdx1bZa67p3vw8CIrYcawKvfjQj/o6uO8QihPe4v71RW0VQzQiu6/bgZatES3Co+u3TH6kb8IcUexuAixyoh')

// endpoint url
const url = 'https://api.avax.network/ext/bc/C/rpc'

// fetching last block
async function fetchBlock () {
  // raw var body request
  const rawLastBlockNumber = JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_blockNumber',
    params: [],
    id: 1
  })

  // block height request
  const requestOptionsLastBlockNumber = {
    method: 'OPTIONS',
    headers: myHeaders,
    body: rawLastBlockNumber,
    redirect: 'follow'
  }

  try {
    const response = await fetch(url, requestOptionsLastBlockNumber)
    const nBlock = await response.json()
    return await nBlock.result
  } catch (ignore) {
    console.log('error fetch')
  }
}

// fetching total fee burned
async function fetchTotalFeeBurned () {
  // raw total balance burned request body
  const rawGetTotalBalance = JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_getBalance',
    params: ['0x0100000000000000000000000000000000000000', 'latest'],
    id: 1
  })

  // total balance request
  const requestOptionsTotalBalance = {
    method: 'OPTIONS',
    headers: myHeaders,
    body: rawGetTotalBalance,
    redirect: 'follow'
  }

  try {
    const response = await fetch(url, requestOptionsTotalBalance)
    const totalBalance = await response.json()
    return await totalBalance.result
  } catch (error) {
    console.error(error)
  }
}

// fee burned per block fetch
async function fetchFeeBurnedPerBlock (lastBlockGathered) {
  // raw body fee burned per block
  const rawFeeBurnedPerBlock = JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_getBlockByNumber',
    params: [lastBlockGathered, true],
    id: 1
  })

  // var for request fee burned per block
  const requestOptionsFeeBurnedPerBlock = {
    method: 'OPTIONS',
    headers: myHeaders,
    body: rawFeeBurnedPerBlock,
    redirect: 'follow'
  }

  try {
    const response = await fetch(url, requestOptionsFeeBurnedPerBlock)
    const blockDescription = await response.json()
    return await blockDescription.result
  } catch (error) {
    console.error(error)
  }
}

exports.fetchBlock = fetchBlock
exports.fetchTotalFeeBurned = fetchTotalFeeBurned
exports.fetchFeeBurnedPerBlock = fetchFeeBurnedPerBlock
