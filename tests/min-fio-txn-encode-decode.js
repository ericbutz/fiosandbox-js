const { TextEncoder, TextDecoder } = require('text-encoding');
const fetch = require('node-fetch') 
const { base64ToBinary, arrayToHex } = require('@fioprotocol/fiojs/dist/chain-numeric');

var ser = require("@fioprotocol/fiojs/dist/chain-serialize");

const httpEndpoint = 'http://testnet.fioprotocol.io'

const transaction = {
  expiration: '2021-04-30T22:30:57.811',
  ref_block_num: 54473,
  ref_block_prefix: 1292004762,
  actions: [{
    account: 'fio.address',
    name: 'addaddress',
    authorization: [{
      actor: 'ifnxuprs2uxv',
      permission: 'active',
    }],
    data: {
      fio_address: 'etest6@fiotestnet',
      public_addresses: [
        {
          chain_code: 'BCH',
          token_code: 'BCH',
          public_address: 'bitcoincash:asdfasdfasdf',
        },
        {
          chain_code: 'DASH',
          token_code: 'DASH',
          public_address: 'asdfasdfasdf',
        }
      ],
      max_fee: 600000000,
      tpid: 'rewards@wallet',
      actor: 'ifnxuprs2uxv',
    },
  }]
};

const fioPushTxn = async () => {
 
  const textDecoder = new TextDecoder();
  const textEncoder = new TextEncoder();

  /**
   * Serializing a transaction takes two steps:
   *  1. Serialize the data in the Actions[] field
   *  2. Serialize the entire transaction
   */

  // 1. Serialize the data in the Actions[] field

  // Retrieve the fio.address ABI
  abiFioAddress = await (await fetch(httpEndpoint + '/v1/chain/get_abi', { body: `{"account_name": "fio.address"}`, method: 'POST' })).json();
  rawAbi = await (await fetch(httpEndpoint + '/v1/chain/get_raw_abi', { body: `{"account_name": "fio.address"}`, method: 'POST' })).json()
  const abi = base64ToBinary(rawAbi.abi);
  //console.log('abi: ', abi)
 
  // Get a Map of all the types from fio.address
  var typesFioAddress = ser.getTypesFromAbi(ser.createInitialTypes(), abiFioAddress.abi);

  // Get the addaddress action type
  const actionAddaddress = typesFioAddress.get('addaddress');
  
  // Serialize the actions[] "data" field (This example assumes a single action, though transactions may hold an array of actions.)
  const buffer = new ser.SerialBuffer({ textEncoder, textDecoder });
  actionAddaddress.serialize(buffer, transaction.actions[0].data);
  serializedData = arrayToHex(buffer.asUint8Array())

  // Get the actions parameter from the transaction and replace the data field with the serialized data field
  rawAction = transaction.actions[0]
  rawAction = {
    ...rawAction,
    data: serializedData
  };

  //console.log('rawAction: ', rawAction)


  // 2. Serialize the entire transaction

  abiMsig = await (await fetch(httpEndpoint + '/v1/chain/get_abi', { body: `{"account_name": "eosio.msig"}`, method: 'POST' })).json()

  var types33 = ser.getTypesFromAbi(ser.createInitialTypes(), abiMsig.abi)

  const action2 = types33.get('transaction');
  //console.log('action2: ', action2)
  //console.log('header: ', types33.get('transaction_header'))

  rawTransaction = {
    ...transaction,  // The order of this matters! The last items put in overwrite earlier items!
    max_net_usage_words: 0,
    max_cpu_usage_ms: 0,
    delay_sec: 0,
    context_free_actions: [],
    actions: [rawAction],     //Actions have to be an array
    transaction_extensions: [],
  }

  // Serialize the transaction
  const buffer2 = new ser.SerialBuffer({ textEncoder, textDecoder });
  action2.serialize(buffer2, rawTransaction);
  serializedTransaction = buffer2.asUint8Array()


  /**
   * Next the serialized transaction must be signed
   */

  const { JsSignatureProvider } = require('@fioprotocol/fiojs/dist/chain-jssig');
  const signatureProvider = new JsSignatureProvider(['5KNMbAhXGTt2Leit3z5JdqqtTbLhxWNf6ypm4r3pZQusNHHKV7a']);

  requiredKeys = ['PUB_K1_6TWRA6o5UNeMVwG8oGxedvhizd8UpfGbnGKaXEiPH2kUZ2LUYm']
  chainId = 'b20901380af44ef59c5918439a1f9a41d83669020319a80574b804a5f95cbd7e'
  serializedContextFreeData = null;

  signedTxn = await signatureProvider.sign({
    chainId: chainId,
    requiredKeys: requiredKeys,
    serializedTransaction: serializedTransaction,
    serializedContextFreeData: serializedContextFreeData,
    abis: abi,
  });

  /**
   * Last, both the serialized transaction and the signature are sent to push_transaction
   */

  const txn = {
    signatures: signedTxn.signatures,
    compression: 0,
    packed_context_free_data: arrayToHex(serializedContextFreeData || new Uint8Array(0)),
    packed_trx: arrayToHex(serializedTransaction)
  }

  console.log('txn: ', txn)

  /*
  pushResult = await fetch(httpEndpoint + '/v1/chain/add_pub_address', {
    body: JSON.stringify(txn),
    method: 'POST',
  });

  if (pushResult.transaction_id) {
    console.log('Success. Transaction ID: ', pushResult.transaction_id);
    console.log('Full Transaction: ', pushResult);
  } else if (pushResult.code) {
    console.log('Error: ', pushResult.error);
  } else {
    console.log('Error: ', pushResult)
  }
  */
  //const buffer2 = new ser.SerialBuffer({ textEncoder, textDecoder });
  //action2.serialize(buffer2, rawTransaction);
  //serializedTransaction = buffer2.asUint8Array()

  // From above const actionAddaddress = typesFioAddress.get('addaddress');

 
  //const fromHexString = hexString =>
  //  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

function hexStringToByte(str) {
  if (!str) {
    return new Uint8Array();
  }
  
  var a = [];
  for (var i = 0, len = str.length; i < len; i+=2) {
    a.push(parseInt(str.substr(i,2),16));
  }
  
  return new Uint8Array(a);
}

console.log('serializedTransaction: ', serializedTransaction)
const packed_trx = arrayToHex(serializedTransaction)
console.log('packed_trx: ', packed_trx)

const byteagain = hexStringToByte(packed_trx)
console.log('byteagain: ', byteagain)

  const buf = new ser.SerialBuffer({ array: byteagain });
  const trx = action2.deserialize(buf);

  console.log(trx)

  // decode action data
  
  const { account, name, data } = trx.actions[0];

  const bytedata = hexStringToByte(data)
console.log('bytedata: ', bytedata)

const buf2 = new ser.SerialBuffer({ array: bytedata });
const trx2 = actionAddaddress.deserialize(buf2);

console.log(trx2)


  //const eosioContract = getContract(EOSIO_TOKEN_ABI);
  //const action = deserializeActionData(eosioContract, account, name, data);
  //trx.actions[i].data = action;

};
/*
function unpackTrx(packedTx) {
  // decode tx
  const initialTypes = createInitialTypes();
  const transactionTypes = getTypesFromAbi(initialTypes, TX_ABI);
  const txType = transactionTypes.get('transaction');
  
  const buf = new SerialBuffer({ array: fromHexString(packedTx) });
  const trx = txType.deserialize(buf);

  

  // decode action data
  const eosioContract = getContract(EOSIO_TOKEN_ABI);
  for (let i = 0; i < trx.actions.length; ++i) {
    const { account, name, data } = trx.actions[i];
    const action = deserializeActionData(eosioContract, account, name, data);
    trx.actions[i].data = action;
  }

  // tx hash
  const hash = crypto.createHash('sha256').update(packedTx, 'hex').digest('hex');
  trx.hash = hash;
  return trx;
}
*/
fioPushTxn();

