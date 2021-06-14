const { TextEncoder, TextDecoder } = require('text-encoding');
const fetch = require('node-fetch')

const httpEndpoint = 'http://testnet.fioprotocol.io'

// Create keypair, fund from the faucet, and register a FIO Address on the Testnet monitor (http://monitor.testnet.fioprotocol.io).
const user = {
  privateKey: '',
  publicKey: '',
  account: '',
  domain: '',
  address: ''
}

const contract = 'fio.address'
const action = 'addaddress'

// Example data for addaddress
const data = {
  fio_address: user.address,
  public_addresses: [
    {
      chain_code: 'BCH',
      token_code: 'BCH',
      public_address: 'bitcoincash:asdfasdfasdf'
    },
    {
      chain_code: 'DASH',
      token_code: 'DASH',
      public_address: 'dashaddressasdfasdfasdf'
    }
  ],
  max_fee: 600000000,
  tpid: '',
  actor: user.account
}

const fioPushTxn = async () => {

  info = await (await fetch(httpEndpoint + '/v1/chain/get_info')).json();
  blockInfo = await (await fetch(httpEndpoint + '/v1/chain/get_block', { body: `{"block_num_or_id": ${info.last_irreversible_block_num}}`, method: 'POST' })).json()
  chainId = info.chain_id;
  currentDate = new Date();
  timePlusTen = currentDate.getTime() + 10000;
  timeInISOString = (new Date(timePlusTen)).toISOString();
  expiration = timeInISOString.substr(0, timeInISOString.length - 1);

  transaction = {
    expiration,
    ref_block_num: blockInfo.block_num & 0xffff,
    ref_block_prefix: blockInfo.ref_block_prefix,
    actions: [{
      account: contract,
      name: action,
      authorization: [{
        actor: user.account,
        permission: 'active'
      }],
      data: data
    }]
  };


  const textDecoder = new TextDecoder();
  const textEncoder = new TextEncoder();

  const { base64ToBinary, arrayToHex } = require('@fioprotocol/fiojs/dist/chain-numeric');
  var ser = require("@fioprotocol/fiojs/dist/chain-serialize");

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
  serializedAction = transaction.actions[0]
  serializedAction = {
    ...serializedAction,
    data: serializedData
  };


  // 2. Serialize the entire transaction

  abiMsig = await (await fetch(httpEndpoint + '/v1/chain/get_abi', { body: `{"account_name": "eosio.msig"}`, method: 'POST' })).json()

  var typesTransaction = ser.getTypesFromAbi(ser.createInitialTypes(), abiMsig.abi)

  // Get the transaction action type
  const txnaction = typesTransaction.get('transaction');

  rawTransaction = {
    ...transaction,
    max_net_usage_words: 0,
    max_cpu_usage_ms: 0,
    delay_sec: 0,
    context_free_actions: [],
    actions: [serializedAction],     //Actions have to be an array
    transaction_extensions: [],
  }

  // Serialize the transaction
  const buffer2 = new ser.SerialBuffer({ textEncoder, textDecoder });
  txnaction.serialize(buffer2, rawTransaction);
  serializedTransaction = buffer2.asUint8Array()


  /**
   * Next the serialized transaction must be signed
   */

  const { JsSignatureProvider } = require('@fioprotocol/fiojs/dist/chain-jssig');
  const signatureProvider = new JsSignatureProvider([user.privateKey]);

  requiredKeys = [user.publicKey]
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

  pushResult = await fetch(httpEndpoint + '/v1/chain/push_transaction', {
    body: JSON.stringify(txn),
    method: 'POST',
  });

  jsonResult = await pushResult.json()

  if (jsonResult.transaction_id) {
    console.log('Success. \nTransaction: ', jsonResult);
  } else if (jsonResult.code) {
    console.log('Error: ', jsonResult.error);
  } else {
    console.log('Error: ', jsonResult)
  }

};

fioPushTxn();

