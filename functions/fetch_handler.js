const fetch = require('node-fetch')
const myHeaders = new fetch.Headers()

// headers list
myHeaders.append('Content-Type', 'application/json')
myHeaders.append('Cookie', '__cfduid=dc54cddb51676178e2e860c64b93b8b0d1616974601; AWSALB=4xaiktDhKcfAT6Fhfx1ruQQHaOvcxnlH8PSFo6W+uoqHuMzgBVixw98DgaQrqfeLqicIzfvaQ33D7jdJMdySdM6JyF+H/amnLKMkzJMeM+9jJxAx70My0CUVdIDX; AWSALBCORS=4xaiktDhKcfAT6Fhfx1ruQQHaOvcxnlH8PSFo6W+uoqHuMzgBVixw98DgaQrqfeLqicIzfvaQ33D7jdJMdySdM6JyF+H/amnLKMkzJMeM+9jJxAx70My0CUVdIDX')

// fetching last block
async function fetchBlock () {
  // raw var body request
  const RawLastBlockNumber = JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 })

  // block height request
  const RequestOptionsLastBlockNumber = {
    method: 'POST',
    headers: myHeaders,
    body: RawLastBlockNumber,
    redirect: 'follow'
  }

  try {
    const response = await fetch('https://api.avax.network/ext/bc/C/rpc', RequestOptionsLastBlockNumber)
    const nBlocco = await response.json()
    return nBlocco.result
  } catch (error) {
    console.error(error)
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
    method: 'POST',
    headers: myHeaders,
    body: rawGetTotalBalance,
    redirect: 'follow'
  }
  try {
    const response = await fetch('https://api.avax.network/ext/bc/C/rpc', requestOptionsTotalBalance)
    const totalbalance = await response.json()
    return totalbalance.result
  } catch (error) {
    console.error(error)
  }
}

// fee burned per block fetch
async function fetchFeeBurnedPerBlock (LastBlockGathered) {
  // raw body fee burned per block
  const RawFeeBurnedPerBlock = JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_getBlockByNumber',
    params: [LastBlockGathered, true],
    id: 1
  })

  // var for request fee burned per block
  const RequestOptionsFeeBurnedPerBlock = {
    method: 'POST',
    headers: myHeaders,
    body: RawFeeBurnedPerBlock,
    redirect: 'follow'
  }

  try {
    const response = await fetch('https://api.avax.network/ext/bc/C/rpc', RequestOptionsFeeBurnedPerBlock)
    const blockDescription = await response.json()
    return blockDescription.result
  } catch (error) {
    console.error(error)
  }
}

exports.fetchBlock = fetchBlock
exports.fetchTotalFeeBurned = fetchTotalFeeBurned
exports.fetchFeeBurnedPerBlock = fetchFeeBurnedPerBlock
