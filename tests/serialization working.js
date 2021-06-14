const { Fio } = require('@fioprotocol/fiojs');
const { TextEncoder, TextDecoder } = require('text-encoding');
const fetch = require('node-fetch') // or 'isomorphic-fetch'

const { base64ToBinary, arrayToHex } = require('@fioprotocol/fiojs/dist/chain-numeric');
var ser = require("@fioprotocol/fiojs/dist/chain-serialize");

// Create keypair on Testnet monitor and fund from faucet. 
const user = {
  privateKey: '5KNMbAhXGTt2Leit3z5JdqqtTbLhxWNf6ypm4r3pZQusNHHKV7a',
  publicKey: 'FIO6TWRA6o5UNeMVwG8oGxedvhizd8UpfGbnGKaXEiPH2kUWEPiEb',
  account: 'ifnxuprs2uxv',
  domain: 'fiotestnet',
  address: 'etest6@fiotestnet'
}

const httpEndpoint = 'http://testnet.fioprotocol.io'

const fioAddPublicAddress = async () => {

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
  
  // Creates a Uint8Array
  const abi = base64ToBinary(rawAbi.abi);
  console.log('abi: ', abi)

  // rawAbiToJson

  const textDecoder = new TextDecoder();
  const textEncoder = new TextEncoder();
 
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
  console.log('abiAbi: ', abiAbi)

  /**
   abiAbi:  { version: 'eosio::abi/1.1',
    structs:
    [ { name: 'extensions_entry', base: '', fields: [Array] },
      { name: 'type_def', base: '', fields: [Array] },
      { name: 'field_def', base: '', fields: [Array] },
      { name: 'struct_def', base: '', fields: [Array] },
      { name: 'action_def', base: '', fields: [Array] },
      { name: 'table_def', base: '', fields: [Array] },
      { name: 'clause_pair', base: '', fields: [Array] },
      { name: 'error_message', base: '', fields: [Array] },
      { name: 'variant_def', base: '', fields: [Array] },
      { name: 'abi_def', base: '', fields: [Array] } ] }
   */

  // Returns a Map of abiTypes from abi.abi.json
  // Note a Map is just a list of key/value pairs
  var abiTypes = ser.getTypesFromAbi(ser.createInitialTypes(), abiAbi)
  console.log('abiTypes: ', abiTypes)

  /**
   * This is the types from abi.abi.json
   
  abiTypes:  Map {
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
      deserialize: [Function: deserialize] }
    etc...
   */

  // abiJson lists out all the structs, actions, etc for fio.address for fio.address abi
  const abiJson = abiTypes.get('abi_def').deserialize(buffer);
  console.log('abiJson: ', abiJson)

  /**
   abiJson:  { version: 'eosio::abi/1.0',
  types: [],
  structs:
   [ { name: 'fioname', base: '', fields: [Array] },
     { name: 'domain', base: '', fields: [Array] },
     { name: 'eosio_name', base: '', fields: [Array] },
     { name: 'regaddress', base: '', fields: [Array] },
     { name: 'tokenpubaddr', base: '', fields: [Array] },
     { name: 'addaddress', base: '', fields: [Array] },
     { name: 'remaddress', base: '', fields: [Array] },
     { name: 'remalladdr', base: '', fields: [Array] },
     { name: 'regdomain', base: '', fields: [Array] },
     { name: 'renewdomain', base: '', fields: [Array] },
     { name: 'renewaddress', base: '', fields: [Array] },
     { name: 'setdomainpub', base: '', fields: [Array] },
     { name: 'burnexpired', base: '', fields: [] },
     { name: 'decrcounter', base: '', fields: [Array] },
     { name: 'bind2eosio', base: '', fields: [Array] },
     { name: 'burnaddress', base: '', fields: [Array] },
     { name: 'xferdomain', base: '', fields: [Array] },
     { name: 'xferaddress', base: '', fields: [Array] },
     { name: 'addbundles', base: '', fields: [Array] } ],
  actions:
   [ { name: 'decrcounter',
       type: 'decrcounter',
       ricardian_contract: '' },
     { name: 'regaddress',
       type: 'regaddress',
       ricardian_contract: '' },
     { name: 'addaddress',
       type: 'addaddress',
       ricardian_contract: '' },
     { name: 'remaddress',
       type: 'remaddress',
       ricardian_contract: '' },
     { name: 'remalladdr',
       type: 'remalladdr',
       ricardian_contract: '' },
     { name: 'regdomain', type: 'regdomain', ricardian_contract: '' },
     { name: 'renewdomain',
       type: 'renewdomain',
       ricardian_contract: '' },
     { name: 'renewaddress',
       type: 'renewaddress',
       ricardian_contract: '' },
     { name: 'burnexpired',
       type: 'burnexpired',
       ricardian_contract: '' },
     { name: 'setdomainpub',
       type: 'setdomainpub',
       ricardian_contract: '' },
     { name: 'bind2eosio',
       type: 'bind2eosio',
       ricardian_contract: '' },
     { name: 'burnaddress',
       type: 'burnaddress',
       ricardian_contract: '' },
     { name: 'xferdomain',
       type: 'xferdomain',
       ricardian_contract: '' },
     { name: 'xferaddress',
       type: 'xferaddress',
       ricardian_contract: '' },
     { name: 'addbundles',
       type: 'addbundles',
       ricardian_contract: '' } ],
  tables:
   [ { name: 'fionames',
       index_type: 'i64',
       key_names: [Array],
       key_types: [Array],
       type: 'fioname' },
     { name: 'domains',
       index_type: 'i64',
       key_names: [Array],
       key_types: [Array],
       type: 'domain' },
     { name: 'accountmap',
       index_type: 'i64',
       key_names: [Array],
       key_types: [Array],
       type: 'eosio_name' } ],
  ricardian_clauses: [],
  error_messages: [],
  abi_extensions: [],
  variants: []
   */

  const types = ser.getTypesFromAbi(ser.createInitialTypes(), abiJson);
  console.log('types: ', types)

  /**
   * This is the same format as abiTypes, but it is the types from fio.address
   
   Types:  Map {
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
      etc...
      
   */

  const action = types.get('addaddress');
  console.log('action: ', action)
    
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



  //console.log('transaction.actions[0].data: ', transaction.actions[0].data)

  /**
   transaction.actions[0].data:  { fio_address: 'etest6@fiotestnet',
    public_addresses:
    [ { chain_code: 'BCH',
        token_code: 'BCH',
        public_address: 'bitcoincash:asdfasdfasdf' },
      { chain_code: 'DASH',
        token_code: 'DASH',
        public_address: 'asdfasdfasdf' } ],
    max_fee: 600000000,
    tpid: 'rewards@wallet',
    actor: 'ifnxuprs2uxv' }
   */

  const buffer1 = new ser.SerialBuffer({ textEncoder, textDecoder });
  //action.serialize(buffer1, rawAction);
  action.serialize(buffer1, transaction.actions[0].data);
  console.log('buffer1: ', buffer1)

  serializedData = arrayToHex(buffer1.asUint8Array())
  console.log('serializedData: ', serializedData);

  rawAction = transaction.actions[0]

   rawAction = {
    ...rawAction,
    data: serializedData
  };

  console.log('rawAction: ', rawAction)







  abiMap2 = new Map()
  rawAbi2 = await (await fetch(httpEndpoint + '/v1/chain/get_raw_abi', { body: `{"account_name": "eosio.msig"}`, method: 'POST' })).json()
  abiMap2.set('fio.address', rawAbi2)

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

  // Creates a Uint8Array
  const abi2 = base64ToBinary(rawAbi2.abi);
  console.log('abi2: ', abi2)

  // rawAbiToJson

  const textDecoder2 = new TextDecoder();
  const textEncoder2 = new TextEncoder();

  //Decodes an abi as Uint8Array into json.
  //rawAbi is not a Uint8array, but abi IS
  const buffer2 = new ser.SerialBuffer({
    textEncoder: textEncoder2,
    textDecoder: textDecoder2,
    array: abi2,
  });
  buffer2.restartRead();

  // Returns list of types from abi.abi.json file
  const abiAbi2 = require('@fioprotocol/fiojs/dist/../src/abi.abi.json');
  console.log('abiAbi2: ', abiAbi2)

  /**
   abiAbi:  { version: 'eosio::abi/1.1',
    structs:
    [ { name: 'extensions_entry', base: '', fields: [Array] },
      { name: 'type_def', base: '', fields: [Array] },
      { name: 'field_def', base: '', fields: [Array] },
      { name: 'struct_def', base: '', fields: [Array] },
      { name: 'action_def', base: '', fields: [Array] },
      { name: 'table_def', base: '', fields: [Array] },
      { name: 'clause_pair', base: '', fields: [Array] },
      { name: 'error_message', base: '', fields: [Array] },
      { name: 'variant_def', base: '', fields: [Array] },
      { name: 'abi_def', base: '', fields: [Array] } ] }
   */

  // Returns a Map of abiTypes from abi.abi.json
  // Note a Map is just a list of key/value pairs
  var abiTypes2 = ser.getTypesFromAbi(ser.createInitialTypes(), abiAbi2)
  console.log('abiTypes2: ', abiTypes2)

  /**
   * This is the types from abi.abi.json
   
  abiTypes:  Map {
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
      deserialize: [Function: deserialize] }
    etc...
   */

  // abiJson lists out all the structs, actions, etc for fio.address for fio.address abi
  const abiJson2 = abiTypes2.get('abi_def').deserialize(buffer2);
  console.log('abiJson2: ', abiJson2)

  /**
   abiJson:  { version: 'eosio::abi/1.0',
  types: [],
  structs:
   [ { name: 'fioname', base: '', fields: [Array] },
     { name: 'domain', base: '', fields: [Array] },
     { name: 'eosio_name', base: '', fields: [Array] },
     { name: 'regaddress', base: '', fields: [Array] },
     { name: 'tokenpubaddr', base: '', fields: [Array] },
     { name: 'addaddress', base: '', fields: [Array] },
     { name: 'remaddress', base: '', fields: [Array] },
     { name: 'remalladdr', base: '', fields: [Array] },
     { name: 'regdomain', base: '', fields: [Array] },
     { name: 'renewdomain', base: '', fields: [Array] },
     { name: 'renewaddress', base: '', fields: [Array] },
     { name: 'setdomainpub', base: '', fields: [Array] },
     { name: 'burnexpired', base: '', fields: [] },
     { name: 'decrcounter', base: '', fields: [Array] },
     { name: 'bind2eosio', base: '', fields: [Array] },
     { name: 'burnaddress', base: '', fields: [Array] },
     { name: 'xferdomain', base: '', fields: [Array] },
     { name: 'xferaddress', base: '', fields: [Array] },
     { name: 'addbundles', base: '', fields: [Array] } ],
  actions:
   [ { name: 'decrcounter',
       type: 'decrcounter',
       ricardian_contract: '' },
     { name: 'regaddress',
       type: 'regaddress',
       ricardian_contract: '' },
     { name: 'addaddress',
       type: 'addaddress',
       ricardian_contract: '' },
     { name: 'remaddress',
       type: 'remaddress',
       ricardian_contract: '' },
     { name: 'remalladdr',
       type: 'remalladdr',
       ricardian_contract: '' },
     { name: 'regdomain', type: 'regdomain', ricardian_contract: '' },
     { name: 'renewdomain',
       type: 'renewdomain',
       ricardian_contract: '' },
     { name: 'renewaddress',
       type: 'renewaddress',
       ricardian_contract: '' },
     { name: 'burnexpired',
       type: 'burnexpired',
       ricardian_contract: '' },
     { name: 'setdomainpub',
       type: 'setdomainpub',
       ricardian_contract: '' },
     { name: 'bind2eosio',
       type: 'bind2eosio',
       ricardian_contract: '' },
     { name: 'burnaddress',
       type: 'burnaddress',
       ricardian_contract: '' },
     { name: 'xferdomain',
       type: 'xferdomain',
       ricardian_contract: '' },
     { name: 'xferaddress',
       type: 'xferaddress',
       ricardian_contract: '' },
     { name: 'addbundles',
       type: 'addbundles',
       ricardian_contract: '' } ],
  tables:
   [ { name: 'fionames',
       index_type: 'i64',
       key_names: [Array],
       key_types: [Array],
       type: 'fioname' },
     { name: 'domains',
       index_type: 'i64',
       key_names: [Array],
       key_types: [Array],
       type: 'domain' },
     { name: 'accountmap',
       index_type: 'i64',
       key_names: [Array],
       key_types: [Array],
       type: 'eosio_name' } ],
  ricardian_clauses: [],
  error_messages: [],
  abi_extensions: [],
  variants: []
   */

  const types2 = ser.getTypesFromAbi(ser.createInitialTypes(), abiJson2);
  console.log('types2: ', types2)

  /**
   * This is the same format as abiTypes, but it is the types from fio.address
   
   Types:  Map {
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
      etc...
      
   */

  const action2 = types2.get('transaction');
  console.log('action2: ', action2)
  console.log('header: ', types2.get('transaction_header'))

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



  //console.log('transaction.actions[0].data: ', transaction.actions[0].data)

  /**
   transaction.actions[0].data:  { fio_address: 'etest6@fiotestnet',
    public_addresses:
    [ { chain_code: 'BCH',
        token_code: 'BCH',
        public_address: 'bitcoincash:asdfasdfasdf' },
      { chain_code: 'DASH',
        token_code: 'DASH',
        public_address: 'asdfasdfasdf' } ],
    max_fee: 600000000,
    tpid: 'rewards@wallet',
    actor: 'ifnxuprs2uxv' }
   */

  console.log('rawaction: ', rawAction)

  rawTransaction = {
    ...transaction,  // The order of this matters! The last items put in overwrite earlier items!
    max_net_usage_words: 0,
    max_cpu_usage_ms: 0,
    delay_sec: 0,
    context_free_actions: [],
    actions: [rawAction],     //Actions have to be an array!!
    transaction_extensions: [],
  }

  console.log('rawTransaction: ', rawTransaction)

  const buffer3 = new ser.SerialBuffer({ textEncoder, textDecoder });
  action2.serialize(buffer3, rawTransaction);
  console.log('buffer3: ', buffer3)

  serializedData2 = arrayToHex(buffer3.asUint8Array())
  console.log('serializedData2: ', serializedData2);

};

fioAddPublicAddress();

