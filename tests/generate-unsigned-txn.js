/**
 * 
 * Creates a json transaction that can be passed to ./clio sign
 * 
 * The rawTransaction output of the example below can be sent as the transaction parameter:
 * 
 * ./clio -u https://fiotestnet.blockpane.com sign -p --chain-id b20901380af44ef59c5918439a1f9a41d83669020319a80574b804a5f95cbd7e --private-key <privatekey> '{"expiration":"2021-12-21T01:12:23.737","ref_block_num":34407,"ref_block_prefix":1071486788,"actions":[{"account":"fio.token","name":"trnsfiopubky","authorization":[{"actor":"ifnxuprs2uxv","permission":"active"}],"data":"3546494f36526b7a59487578614674375962794147714546466546436f7932504a4431745a6a7a796d67684a6b327a396748324c565900ca9a3b0000000000e40b5402000000b0bb16f856dde77200"}],"max_net_usage_words":0,"max_cpu_usage_ms":0,"delay_sec":0,"context_free_actions":[],"transaction_extensions":[]}'
 * 
 */
const { TextEncoder, TextDecoder } = require('text-encoding');
const fetch = require('node-fetch') 
const { arrayToHex } = require('@fioprotocol/fiojs/dist/chain-numeric');

var ser = require("@fioprotocol/fiojs/dist/chain-serialize");

const httpEndpoint = 'http://testnet.fioprotocol.io',
  contractAccount = 'fio.token',
  action = 'trnsfiopubky',
  actor = '',  // Account/actor of the user sending the FIO
  payeePublicKey = '',  // FIO public key of the user receiving the FIO
  amount = 1000000000

const getUnsignedTxn = async () => {

  info = await (await fetch(httpEndpoint + '/v1/chain/get_info')).json();
  blockInfo = await (await fetch(httpEndpoint + '/v1/chain/get_block', { body: `{"block_num_or_id": ${info.last_irreversible_block_num}}`, method: 'POST' })).json();
  chainId = info.chain_id;
  currentDate = new Date();
  timePlusTenMinutes = currentDate.getTime() + 600000;
  timeInISOString = (new Date(timePlusTenMinutes)).toISOString();
  expiration = timeInISOString.substr(0, timeInISOString.length - 1);

  const transaction = {
    expiration,
    "ref_block_num": blockInfo.block_num & 0xffff,
    "ref_block_prefix": blockInfo.ref_block_prefix,
    "actions": [{
      "account": contractAccount,
      "name": action,
      "authorization": [{
        "actor": actor,
        "permission": 'active',
      }],
      "data": {
        "payee_public_key": payeePublicKey,
        "amount": amount,
        "max_fee": 10000000000,
        "tpid": '',
        "actor": actor,
      },
    }]
  };
 
  const textDecoder = new TextDecoder();
  const textEncoder = new TextEncoder();

  // Retrieve the fio.address ABI
  abiFioAddress = await (await fetch(httpEndpoint + '/v1/chain/get_abi', { body: `{"account_name": "${contractAccount}"}`, method: 'POST' })).json();
  rawAbi = await (await fetch(httpEndpoint + '/v1/chain/get_raw_abi', { body: `{"account_name": "${contractAccount}"}`, method: 'POST' })).json();
 
  // Get a Map of all the types from fio.address
  var typesFioAddress = ser.getTypesFromAbi(ser.createInitialTypes(), abiFioAddress.abi);

  // Get the addaddress action type
  const actionAddaddress = typesFioAddress.get(action);
  
  // Serialize the actions[] "data" field (This example assumes a single action, though transactions may hold an array of actions.)
  const buffer = new ser.SerialBuffer({ textEncoder, textDecoder });
  actionAddaddress.serialize(buffer, transaction.actions[0].data);
  serializedData = arrayToHex(buffer.asUint8Array())

  // Get the actions parameter from the transaction and replace the data field with the serialized data field
  rawAction = transaction.actions[0];
  rawAction = {
    ...rawAction,
    data: serializedData
  };

  rawTransaction = {
    ...transaction,  // The order of this matters! The last items put in overwrite earlier items!
    max_net_usage_words: 0,
    max_cpu_usage_ms: 0,
    delay_sec: 0,
    context_free_actions: [],
    actions: [rawAction],     //Actions have to be an array
    transaction_extensions: [],
  }

  console.log('rawTransaction: ', JSON.stringify(rawTransaction));

};

getUnsignedTxn();

