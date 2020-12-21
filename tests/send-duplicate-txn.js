require('mocha')
const {expect} = require('chai')
const {newUser} = require('../utils.js');
const {FIOSDK } = require('@fioprotocol/FIOSDK')
config = require('../config.js');
const rp = require('request-promise');
const { Fio } = require('@fioprotocol/fiojs');
fetch = require('node-fetch');
const Transactions_2 = require("@fioprotocol/FIOSDK/lib/transactions/Transactions")
let transaction = new Transactions_2.Transactions

before(async () => {

})

function callFioApiSigned = async (endPoint, txn) => {
  info = await (await fetch(fiourl + 'get_info')).json();
  blockInfo = await (await fetch(fiourl + 'get_block', {body: `{"block_num_or_id": ${info.last_irreversible_block_num}}`, method: 'POST'})).json()
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
         account: txn.account,
         name: txn.action,
         authorization: [{
             actor: txn.actor,
             permission: 'active',
         }],
         data: txn.data,
     }]
  };

  abiMap = new Map()
  tokenRawAbi = await (await fetch(fiourl + 'get_raw_abi', {body: '{"account_name": "' + txn.account + '"}', method: 'POST'})).json()
  abiMap.set(txn.account, tokenRawAbi)
 
  var privateKeys = [txn.privKey];
  
  const tx = await Fio.prepareTransaction({
    transaction,
    chainId,
    privateKeys,
    abiMap,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
  });

  pushResult = await fetch(fiourl + endPoint, {
      body: JSON.stringify(tx),
      method: 'POST',
  });

  json = await pushResult.json()
  return json;
};

describe(`Getpubaddress mainnet test`, () => {
  it(`addaction with 7 character action and 50 character contract succeeds.`, async () => {
    const result = await callFioApiSigned('push_transaction', {
      action: 'addaction',
      account: 'eosio',
      actor: fiotoken.account,
      privKey: fiotoken.privateKey,
      data: {
        action: newAction + 'a',
        contract: contract_50,
        actor: fiotoken.account
      }
    })
    //console.log('Result: ', result)
    expect(result.processed.receipt.status).to.equal('executed');
  })

})
