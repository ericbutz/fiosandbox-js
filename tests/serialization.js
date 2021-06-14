const { TextEncoder, TextDecoder } = require('text-encoding');
const fetch = require('node-fetch') // or 'isomorphic-fetch'
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

const serializeTransaction = async () => {
 
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

  //console.log('rawTransaction: ', rawTransaction)

  const buffer3 = new ser.SerialBuffer({ textEncoder, textDecoder });
  action2.serialize(buffer3, rawTransaction);
  //console.log('buffer3: ', buffer3)
  serializedTransaction = buffer3.asUint8Array()
  //serializedTransaction = arrayToHex(buffer3.asUint8Array())
  //console.log('serializedTransaction: ', serializedTransaction);



  const { JsSignatureProvider } = require('@fioprotocol/fiojs/dist/chain-jssig');
  const { Api, signAllAuthorityProvider } = require('@fioprotocol/fiojs/dist/chain-api');

  const signatureProvider = new JsSignatureProvider(['5KNMbAhXGTt2Leit3z5JdqqtTbLhxWNf6ypm4r3pZQusNHHKV7a']);
  //const authorityProvider = signAllAuthorityProvider;

  //const availableKeys = await signatureProvider.getAvailableKeys();
  //const requiredKeys = await authorityProvider.getRequiredKeys({ transaction, availableKeys });
  //requiredKeys = ['5KNMbAhXGTt2Leit3z5JdqqtTbLhxWNf6ypm4r3pZQusNHHKV7a']
  requiredKeys = ['PUB_K1_6TWRA6o5UNeMVwG8oGxedvhizd8UpfGbnGKaXEiPH2kUZ2LUYm']
  chainId = 'b20901380af44ef59c5918439a1f9a41d83669020319a80574b804a5f95cbd7e'

  serializedContextFreeData = null;

  //console.log('chainId: ', chainId)
  //console.log('requiredKeys: ', requiredKeys)
  //console.log('serializedTransaction: ', serializedTransaction)
  //console.log('serializedContextFreeData: ', serializedContextFreeData)


  pushTransactionArgs = await signatureProvider.sign({
    chainId: chainId,
    requiredKeys: requiredKeys,
    serializedTransaction: serializedTransaction,
    serializedContextFreeData: serializedContextFreeData,
    abis: abi,
  });

  //console.log('pushTransactionArgs: ', pushTransactionArgs)

  const txn = {
    signatures: pushTransactionArgs.signatures,
    compression: 0,
    packed_context_free_data: arrayToHex(serializedContextFreeData || new Uint8Array(0)),
    packed_trx: arrayToHex(pushTransactionArgs.serializedTransaction)
  }

  console.log('txn: ', txn)

};

serializeTransaction();

