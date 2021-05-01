const { Fio } = require('@fioprotocol/fiojs');
const { TextEncoder, TextDecoder } = require('text-encoding');
const fetch = require('node-fetch') // or 'isomorphic-fetch'

const httpEndpoint = 'http://testnet.fioprotocol.io'

// Create keypair on Testnet monitor and fund from faucet. 
const user = {
  privateKey: '5KNMbAhXGTt2Leit3z5JdqqtTbLhxWNf6ypm4r3pZQusNHHKV7a',
  publicKey: 'FIO6TWRA6o5UNeMVwG8oGxedvhizd8UpfGbnGKaXEiPH2kUWEPiEb',
  account: 'ifnxuprs2uxv',
  domain: 'fiotestnet', 
  address: 'etest6@fiotestnet' 
}

const fioAddPublicAddress = async () => {
  info = await (await fetch(httpEndpoint + '/v1/chain/get_info')).json();
  blockInfo = await (await fetch(httpEndpoint + '/v1/chain/get_block', {body: `{"block_num_or_id": ${info.last_irreversible_block_num}}`, method: 'POST'})).json()
  chainId = info.chain_id;
  currentDate = new Date();
  timePlusTen = currentDate.getTime() + 10000;
  timeInISOString = (new Date(timePlusTen)).toISOString();
  expiration = timeInISOString.substr(0, timeInISOString.length - 1);
  
  transaction = {
    expiration: '2021-04-30T22:30:57.811',
    //ref_block_num: blockInfo.block_num & 0xffff,
    ref_block_num: 54473,
    //ref_block_prefix: blockInfo.ref_block_prefix,
    ref_block_prefix: 1292004762,
     actions: [{
         account: 'fio.address',
         name: 'addaddress',
         authorization: [{
             actor: user.account,
             permission: 'active',
         }],
         data: {
            fio_address: user.address,
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
            actor: user.account,
         },
     }]
  };

  //console.log('transaction: ', transaction)

  abiMap = new Map()
  rawAbi = await (await fetch(httpEndpoint + '/v1/chain/get_raw_abi', { body: `{"account_name": "fio.address"}`, method: 'POST' })).json()
  abiMap.set('fio.address', rawAbi)

   /**
    abiMap:

    Map {
      'fio.address' => { 
        account_name: 'fio.address',
        code_hash: '0aacfee458bee8aa4ba6773bfcf05f9d3565a12e2ea03dfa4124aa32672d6948',
        abi_hash: '0dca0ca50be70bb04a84c2494e3eecdf72c083498a3acdbe0ed7ebc4a89d8ad9',
        abi: 'DmVvc2lvOjphYmkvMS4wABMHZmlvbmFtZQAJAmlkBnVpbnQ2NAR... etc ...FpbgBANTJPTREyA2k2NAEHYWNjb3VudAEGdWludDY0CmVvc2lvX25hbWUAAAAA=' 
      } 
    }

  */
 
  var privateKeys = [user.privateKey];
  const textDecoder = new TextDecoder();
  const textEncoder = new TextEncoder();

  const tx = await Fio.prepareTransaction({
    transaction,
    chainId,
    privateKeys,
    abiMap,
    textDecoder,
    textEncoder
  });

  //console.log('tx: ', tx)

  /**
    tx:  
    { signatures: [ 'SIG_K1_KkxZUPZucyD8kV54S4WYuoYPLGMNZUky8nuSzHDmhdHihns42UrEX9TKwqJPmqLqA2GRt4hpdLi4bAW6J1oETozr2WJFnT' ],
      compression: 0,
      packed_context_free_data: '',
      packed_trx: 'fe3a3160aad4a829196f0000000001003056372503a85b0000c6eaa664523201b0bb16f856dde77200000000a8ed32326a116574657374364066696f746573746e657402034243480342434818626974636f696e636173683a617364666173646661736466044441534804444153480c6173646661736466617364660046c32300000000b0bb16f856dde7720e726577617264734077616c6c657400' 
    }
  */
  
  // 1. Sign transaction
  const { Api, signAllAuthorityProvider } = require('@fioprotocol/fiojs/dist/chain-api');
  const { JsSignatureProvider } = require('@fioprotocol/fiojs/dist/chain-jssig');
  const { base64ToBinary, arrayToHex } = require('@fioprotocol/fiojs/dist/chain-numeric');
  const { AbiProvider, BinaryAbi } = require('@fioprotocol/fiojs/dist/chain-api-interfaces');
  //const { chain_numeric_1 } = require('@fioprotocol/fiojs/dist/chain-api-interfaces');
  var ser = require("@fioprotocol/fiojs/dist/chain-serialize");
  

  const signatureProvider = new JsSignatureProvider(privateKeys);
  const authorityProvider = signAllAuthorityProvider;

  const abi = base64ToBinary(rawAbi.abi);

  const abiProvider = {
    getRawAbi: async function (accountName) {
      //const abi = base64ToBinary(rawAbi.abi);
      //console.log('abi: ', abi)
      binaryAbi = { accountName: rawAbi.account_name, abi: abi }
      //console.log('binaryAbi: ', binaryAbi)
      return binaryAbi;
    }
  };
  
  const api = new Api({
    signatureProvider, authorityProvider, abiProvider, chainId, textDecoder, textEncoder
  });

  const { signatures, serializedTransaction, serializedContextFreeData } = await api.transact(transaction);

 
/* api.transact

    
     * Create a transaction.
     *
     * Named Parameters:
     *    * `sign`: sign this transaction?
     * @returns `{signatures, serializedTransaction}`
     
    public async transact(transaction: any, { sign = true }:
              { sign?: boolean; } = {}): Promise < any > {
                let info: GetInfoResult;

                if(!this.hasRequiredTaposFields(transaction)) {
          throw new Error('Required configuration or TAPOS fields are not present');
        }

        const abis: BinaryAbi[] = await this.getTransactionAbis(transaction);

        transaction = {
          ...transaction,
          context_free_actions: await this.serializeActions(transaction.context_free_actions || []),
          actions: await this.serializeActions(transaction.actions)
        };
        const serializedTransaction = this.serializeTransaction(transaction);
        const serializedContextFreeData = this.serializeContextFreeData(transaction.context_free_data);
        let pushTransactionArgs: PushTransactionArgs = {
          serializedTransaction, serializedContextFreeData, signatures: []
        };

        if (sign) {
          const availableKeys = await this.signatureProvider.getAvailableKeys();
          const requiredKeys = await this.authorityProvider.getRequiredKeys({ transaction, availableKeys });
          pushTransactionArgs = await this.signatureProvider.sign({
            chainId: this.chainId,
            requiredKeys,
            serializedTransaction,
            serializedContextFreeData,
            abis,
          });
        }

        return pushTransactionArgs;
    }
*/

  /*
    transaction = {
      ...transaction,
      context_free_actions: await this.serializeActions(transaction.context_free_actions || []),
      actions: await this.serializeActions(transaction.actions)
    };
  */
  
  
  
  
/** getAbi
 * 
 */
  
  //const rawAbi = (await this.abiProvider.getRawAbi(accountName)).abi;
  //const abi = this.rawAbiToJson(rawAbi);

/** rawAbiToJson
 Decodes an abi as Uint8Array into json. 

  public rawAbiToJson(rawAbi: Uint8Array): Abi {
    const buffer = new ser.SerialBuffer({
      textEncoder: this.textEncoder,
      textDecoder: this.textDecoder,
      array: rawAbi,
    });
    if (!ser.supportedAbiVersion(buffer.getString())) {
      throw new Error('Unsupported abi version');
    }
    buffer.restartRead();
    return this.abiTypes.get('abi_def').deserialize(buffer);
  }
*/
  
  //Decodes an abi as Uint8Array into json.
  //rawAbi is not a Uint8array, but abi IS
  const buffer = new ser.SerialBuffer({
    textEncoder: textEncoder,
    textDecoder: textDecoder,
    array: abi,
  });
  buffer.restartRead();

  // Returns list of types from abi.abi.json file
  const abiAbi = require('@fioprotocol/fiojs/dist/../src/abi.abi.json');
  // I think we take the list of template "types" from the abi.abi.json file... need to research this more
  var abiTypes = ser.getTypesFromAbi(ser.createInitialTypes(), abiAbi)

  // abiJson lists out all the structs, actions, etc for fio.address ( which is 'abi')
  const abiJson = abiTypes.get('abi_def').deserialize(buffer);
  //console.log('abiJson: ', abiJson)

  const types = ser.getTypesFromAbi(ser.createInitialTypes(), abiJson);
  //console.log('types: ', types)
  
  //return api.abiTypes.get('abi_def').deserialize(buffer);
  
  
/* getContract
* Get data needed to serialize actions in a contract

  public async getContract(accountName: string, reload = false): Promise < ser.Contract > {
    const abi = await this.getAbi(accountName, reload);
    const types = ser.getTypesFromAbi(ser.createInitialTypes(), abi);
    const actions = new Map < string, ser.Type> ();
    for (const { name, type } of abi.actions) {
      actions.set(name, ser.getType(types, type));
    }
    const result = { types, actions };
    this.contracts.set(accountName, result);
    return result;
  }
*/
  rawActions = transaction.actions[0]
  
  const actions = new Map();
  // actions > Map {}

  //console.log('actions new map: ', actions);
  for (const { name, type } of abiJson.actions) {
    actions.set(name, ser.getType(types, type));
  }
  const contract = { types, actions };
  //console.log('MMMMMYYY contract: ', contract);
  /**
   contract is a list of all of the types and actions found in the fio.address contract

{ types:
   Map {
     'bool' => { name: 'bool',
       aliasOfName: '',
       arrayOf: null,
       optionalOf: null,
       extensionOf: null,
       baseName: '',
       base: null,
       fields: [],
       serialize: [Function: serialize],
       deserialize: [Function: deserialize] },
     'uint8' => { name: 'uint8',
       aliasOfName: '',
       arrayOf: null,
       optionalOf: null,
       extensionOf: null,
       baseName: '',
       base: null,
       fields: [],
       serialize: [Function: serialize],
       deserialize: [Function: deserialize] },
      etc. },
  actions:
   Map {
     'decrcounter' => { name: 'decrcounter',
       aliasOfName: '',
       arrayOf: null,
       optionalOf: null,
       extensionOf: null,
       baseName: '',
       base: null,
       fields: [Array],
       serialize: [Function: serializeStruct],
       deserialize: [Function: deserializeStruct] },
     'regaddress' => { name: 'regaddress',
       aliasOfName: '',
       arrayOf: null,
       optionalOf: null,
       extensionOf: null,
       baseName: '',
       base: null,
       fields: [Array],
       serialize: [Function: serializeStruct],
       deserialize: [Function: deserializeStruct] },
      etc. }
   }


      
  */
  
  
  const action = contract.actions.get('addaddress');
  //console.log('MMMMMYYY action: ', action);

  /** action:
  { name: 'addaddress',
    aliasOfName: '',
    arrayOf: null,
    optionalOf: null,
    extensionOf: null,
    baseName: '',
    base: null,
    fields:
    [ { name: 'fio_address', typeName: 'string', type: [Object] },
      { name: 'public_addresses',
        typeName: 'tokenpubaddr[]',
        type: [Object] },
      { name: 'max_fee', typeName: 'int64', type: [Object] },
      { name: 'actor', typeName: 'name', type: [Object] },
      { name: 'tpid', typeName: 'string', type: [Object] } ],
    serialize: [Function: serializeStruct],
    deserialize: [Function: deserializeStruct] }
   */

  //console.log('MMMMMYYY transaction.actions[0].data: ', transaction.actions[0].data);

  const buffer3 = new ser.SerialBuffer({ textEncoder, textDecoder });
  action.serialize(buffer3, transaction.actions[0].data);
  //console.log('MMMMYY buffer3): ', buffer3)
  serializedData = arrayToHex(buffer3.asUint8Array())
  //console.log('MMMMMYYY serializedData: ', serializedData);

  //console.log('transaction.actions[0]: ', transaction.actions[0])

  rawActions = {
    ...rawActions,
    data: serializedData
  };

  //console.log('rawActions: ', rawActions)

  rawTransaction = {
    ...transaction,
    actions: rawActions
  }

  var transactionAbi = require('@fioprotocol/fiojs/src/transaction.abi.json');
  transactionTypes = ser.getTypesFromAbi(ser.createInitialTypes(), transactionAbi);
  //console.log('transactionTypes: ', transactionTypes)
  const txn = transactionTypes.get('transaction');
  //console.log('txn: ', txn.fields)

  transaction2 = {
    max_net_usage_words: 0,
    max_cpu_usage_ms: 0,
    delay_sec: 0,
    context_free_actions: [],
    actions: [],
    transaction_extensions: [],
    ...rawTransaction,
  }

  /*

  rawAbiMsig = await (await fetch(httpEndpoint + '/v1/chain/get_raw_abi', { body: `{"account_name": "eosio.msig"}`, method: 'POST' })).json()

  //console.log('rawAbiMsig: ', rawAbiMsig)

  const rawAbiMsigBinary = base64ToBinary(rawAbiMsig.abi);

  //console.log('rawAbiMsigBinary: ', rawAbiMsigBinary)

  const buffer5 = new ser.SerialBuffer({
    textEncoder: textEncoder,
    textDecoder: textDecoder,
    array: rawAbiMsigBinary,
  });
  buffer5.restartRead();

  abiMsig = await (await fetch(httpEndpoint + '/v1/chain/get_abi', { body: `{"account_name": "eosio.msig"}`, method: 'POST' })).json()

  //console.log('abiMsig: ', abiMsig)

  transactionTypes = ser.getTypesFromAbi(ser.createInitialTypes(), abiMsig);
  //console.log('transactionTypes: ', transactionTypes)

  
  const abiJson2 = abiTypes.get('abi_def').deserialize(buffer5);
  //console.log('abiJson: ', abiJson2)

  const types2 = ser.getTypesFromAbi(ser.createInitialTypes(), abiJson2);

  //console.log('types2: ', types2)

  var txnmap = new Map();
  // actions > Map {}

  txnmap.set('transaction', abiJson2)

  //console.log('txnmap: ', txnmap)

  //console.log('actions new map: ', actions);
  //for (const { name, type } of types2.txnmap) {
  //  txnmap.set(name, ser.getType(types, type));
  //}
  const contract2 = { types, actions };

  const txnx = txnmap.actions.get('transaction');

  console.log('txnx: ', txnx)

  const buffer8 = new ser.SerialBuffer({ textEncoder, textDecoder });
  txnx.serialize(buffer8, transaction);
  serializedData2 = arrayToHex(buffer8.asUint8Array())

  console.log('serializedData2: ', serializedData2)

  //const txn = transactionTypes.get('transaction');
  //console.log('txn: ', txn.fields)

  //const buffer5 = new ser.SerialBuffer({ textEncoder, textDecoder });
  //txn.serialize(buffer5, transaction2);
  //serializedTransaction = arrayToHex(buffer5.asUint8Array())

  //console.log('serializedTransaction: ', serializedTransaction)


  //transactionTypes.get('transaction').serialize(buffer5, transaction2);
  
  transaction2 = {
    max_net_usage_words: 0,
    max_cpu_usage_ms: 0,
    delay_sec: 0,
    context_free_actions: [],
    actions: [],
    transaction_extensions: [],
    ...rawTransaction,
  }
  //transactionTypes.get('transaction').serialize(buffer5, transaction2);
*/
  /*
  transactionTypes.serialize(buffer5, 'transaction', {
    max_net_usage_words: 0,
    max_cpu_usage_ms: 0,
    delay_sec: 0,
    context_free_actions: [],
    actions: [],
    transaction_extensions: [],
    ...rawTransaction,
  });
*/
  //sertest = buffer5.asUint8Array()

  //console.log('sertest: ', sertest)

  //console.log('rawTransaction: ', rawTransaction)

  // Serialization: 
  //var transactionAbi = require('../src/transaction.abi.json');
  //transactionTypes = ser.getTypesFromAbi(ser.createInitialTypes(), abi);
  //console.log('transactionTypes: ', transactionTypes)
  //transactionTypes.get(type).serialize(buffer, value);
  //this.serialize(buffer, etc...

  //const buffer4 = new ser.SerialBuffer({ textEncoder, textDecoder });
  //action.serialize(buffer4, transaction.actions[0].data);
  //console.log('MMMMYY buffer3): ', buffer3)
  //serializedData = arrayToHex(buffer3.asUint8Array())
  //console.log('MMMMMYYY serializedData: ', serializedData);

  /** serializeActions should look like this:
    { account: 'fio.address',
      name: 'addaddress',
      authorization: [ { actor: 'ifnxuprs2uxv', permission: 'active' } ],
      data:
   '116574657374364066696F746573746E657402034243480342434818626974636F696E636173683A617364666173646661736466044441534804444153480C6173646661736466617364660046C32300000000B0BB16F856DDE7720E726577617264734077616C6C6574' }
  */
  
/* serializeActions
 Convert actions to hex

public async serializeActions(actions: ser.Action[]): Promise < ser.SerializedAction[] > {
  return await Promise.all(actions.map(async ({ account, name, authorization, data }) => {
    const contract = await this.getContract(account);
    return ser.serializeAction(
      contract, account, name, authorization, data, this.textEncoder, this.textDecoder);
  }));
}



     actions: [{
         account: 'fio.address',
         name: 'addaddress',
         authorization: [{
             actor: user.account,
             permission: 'active',
         }],
         data: {
            fio_address: user.address,
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
            actor: user.account,
         },
     }]
*/
  
  //serializedActions = ser.serializeAction(contract, transaction.actions[0].account, transaction.actions[0].name, transaction.actions[0].authorization, transaction.actions[0].data, textEncoder, textDecoder);

  //var buffer = new SerialBuffer({ textEncoder: textEncoder, textDecoder: textDecoder });
  //action.serialize(buffer, transaction.data);
  //serializeActionData = arrayToHex(buffer.asUint8Array())

  //console.log('ZZZZZZ serializedActions: ', serializedActions)
/*
  transaction2 = {
    ...transaction,
    context_free_actions: null,
    actions: serializedActions
  };
*/
  //console.log('transaction2: ', transaction2)

  

  // I am using ser. right now. To break it down further need to get into these:
  /* serializeActionData
  
    var action = contract.actions.get(name);
    var buffer = new SerialBuffer({ textEncoder: textEncoder, textDecoder: textDecoder });
    action.serialize(buffer, data);
    //return arrayToHex(buffer.asUint8Array());
    serializeActionData = arrayToHex(buffer.asUint8Array())
  */

/* serializeAction

 Return action in serialized form 
    export function serializeAction(contract: Contract, account: string, name: string,
      authorization: Authorization[], data: any, textEncoder: TextEncoder,
      textDecoder: TextDecoder): SerializedAction {
      return {
        account,
        name,
        authorization,
        data: serializeActionData(contract, account, name, data, textEncoder, textDecoder),
      };
    }
*/
  
 //const abis: BinaryAbi[] = await this.getTransactionAbis(transaction);

/** getTransactionAbis
  Get abis needed by a transaction

    public async getTransactionAbis(transaction: any, reload = false): Promise < BinaryAbi[] > {
      const actions = (transaction.context_free_actions || []).concat(transaction.actions);
      const accounts: string[] = actions.map((action: ser.Action): string => action.account);
      const uniqueAccounts: Set<string> = new Set(accounts);
      const actionPromises: Array<Promise< BinaryAbi >> =[...uniqueAccounts].map(
        async (account: string): Promise<BinaryAbi> => ({
          accountName: account, abi: (await this.getCachedAbi(account, reload)).rawAbi,
        }));
    return Promise.all(actionPromises);
    }
*/

  
  // THIS IS WHERE YOU STOPPED. NEED TO FIGURE OUT serializeTransaction, looks like you need a type (from the list of ABI types)
  // and a value. What are those? Read docs on eosio serialization.

  //var buffer2 = new ser.SerialBuffer({ textEncoder, textDecoder });
  //var fioAbi = require('@fioprotocol/fiojs/src/encryption-fio.abi.json');
  //var fioTypes = ser.getTypesFromAbi(ser.createInitialTypes(), fioAbi);
  //fioTypes.get(type).serialize(buffer2, value);
  //var message = Buffer.from(buffer2.asUint8Array());
  //console.log('message: ', message)

  //const serializedTransaction2 = this.serializeTransaction(transaction2);

  /* serializeTransaction
var buffer = new ser.SerialBuffer({ textEncoder: this.textEncoder, textDecoder: this.textDecoder });
this.serialize(buffer, 'transaction', __assign({ max_net_usage_words: 0, max_cpu_usage_ms: 0, delay_sec: 0, context_free_actions: [], actions: [], transaction_extensions: [] }, transaction));
return buffer.asUint8Array();
*/

  // sign

  /*
  const availableKeys = await signatureProvider.getAvailableKeys();
  const requiredKeys = await authorityProvider.getRequiredKeys({ transaction, availableKeys });
  pushTransactionArgs = await signatureProvider.sign({
    chainId: this.chainId,
    requiredKeys,
    serializedTransaction,
    serializedContextFreeData,
    abis,
  });
 */ 
  //return pushTransactionArgs;
  //console.log('pushTransactionArgs: ', pushTransactionArgs)




  //console.log('signatures: ', signatures)
  //console.log('serializedTransaction: ', serializedTransaction)
  //console.log('serializedContextFreeData: ', serializedContextFreeData)

  const tx2 = {
    signatures,
    compression: 0,
    packed_context_free_data: arrayToHex(serializedContextFreeData || new Uint8Array(0)),
    packed_trx: arrayToHex(serializedTransaction),
  }
  //console.log('serializedTransaction: ', serializedTransaction)

  console.log('tx2: ', tx2)

  pushResult = await fetch(httpEndpoint + '/v1/chain/add_pub_address', {
      body: JSON.stringify(tx2),
      method: 'POST',
  });
  
  //json = await pushResult.json();

  if (json.transaction_id) {
    console.log('Success. Transaction ID: ', json.transaction_id);
    console.log('Full Transaction: ', json);
  } else if (json.code) {
    console.log('Error: ', json.error);
  } else {
    console.log('Error: ', json)
  }

};

fioAddPublicAddress();

