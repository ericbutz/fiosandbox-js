const { TextEncoder, TextDecoder } = require('text-encoding');
const fetch = require('node-fetch'); 
const ser = require("@fioprotocol/fiojs/dist/chain-serialize");

const httpEndpoint = 'http://testnet.fioprotocol.io';

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

// This is the transaction that was encoded
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

// After seralization and signing: 

const txn =   {
  signatures: [
    'SIG_K1_Kezyrdhxy65ej8Uir1Kts3gCp8RQF5UhuQavc1rU3CdEA4V4nmxM95iW9F6mAyMs6YzsAk8CXCpY9GhuApVkw5FWG3giGd'
  ],
  compression: 0,
  packed_context_free_data: '',
  packed_trx: '22858c60c9d49a6d024d0000000001003056372503a85b0000c6eaa664523201b0bb16f856dde77200000000a8ed32326a116574657374364066696f746573746e657402034243480342434818626974636f696e636173683a617364666173646661736466044441534804444153480c6173646661736466617364660046c32300000000b0bb16f856dde7720e726577617264734077616c6c657400'
}


const decodeTxn = async () => {

  // Convert packed transaction hexadecimal string to byte array

  const serializedTransaction = hexStringToByte(txn.packed_trx)

  // Deserialize the entire transaction

  const abiMsig = await (await fetch(httpEndpoint + '/v1/chain/get_abi', { body: `{"account_name": "eosio.msig"}`, method: 'POST' })).json()
  const transactionTypes = ser.getTypesFromAbi(ser.createInitialTypes(), abiMsig.abi)
  const txType = transactionTypes.get('transaction');
  const buf = new ser.SerialBuffer({ array: serializedTransaction });
  const trx = txType.deserialize(buf);

  // Deserialize the action data

  const { account, name, data } = trx.actions[0];
  const actionDataByte = hexStringToByte(data)
  const abiFioAddress = await (await fetch(httpEndpoint + '/v1/chain/get_abi', { body: `{"account_name": "fio.address"}`, method: 'POST' })).json();
  // Get a Map of all the types from fio.address
  const typesFioAddress = ser.getTypesFromAbi(ser.createInitialTypes(), abiFioAddress.abi);
  // Get the addaddress action type
  const actionAddaddressType = typesFioAddress.get('addaddress');

  const buf2 = new ser.SerialBuffer({ array: actionDataByte });
  const actionData = actionAddaddressType.deserialize(buf2);

  console.log(actionData)

}

decodeTxn();
