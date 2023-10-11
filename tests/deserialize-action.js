const { TextEncoder, TextDecoder } = require('text-encoding');
const fetch = require('node-fetch') 
var ser = require("@fioprotocol/fiojs/dist/chain-serialize");

const httpEndpoint = 'http://testnet.fioprotocol.io'

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

const data = '9096DF2ACD5DFE250000000080AB26A70000000000000000010000000002F0AD5B8BD5D54D5900000000A8ED3232010090BC2254C29709CF00000000A8ED3232010000EE8C6A5C00000000'
contract = "eosio"
action = "updateauth"

// const data = '116574657374364066696f746573746e657402034243480342434818626974636f696e636173683a617364666173646661736466044441534804444153480c6173646661736466617364660046c32300000000b0bb16f856dde7720e726577617264734077616c6c6574'
// contract = "fio.address"
// action = "addaddress"


const main = async () => {

  dataArray = ser.hexToUint8Array(data);
  //console.log('Data: ', dataArray);

  const buffer = new ser.SerialBuffer({ textDecoder, textEncoder });
  buffer.pushArray(dataArray);
  //console.log('buffer: ', buffer);

  // Retrieve the ABI
  contractABI = await (await fetch(httpEndpoint + '/v1/chain/get_abi', { body: `{"account_name": "${contract}"}`, method: 'POST' })).json();

  // Get a Map of all the types from the contract
  var typesMap = ser.getTypesFromAbi(ser.createInitialTypes(), contractABI.abi);
  //console.log('typesMap', typesMap)

  // Get the action type
  const actionType = typesMap.get(action);
  //console.log('actionType', actionType)
  
  const actionData = actionType.deserialize(buffer)
  console.log ('Deserialized action data: ', console.log(JSON.stringify(actionData, null, 4)));

}

main();