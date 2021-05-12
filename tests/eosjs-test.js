//const { JsonRpc, RpcError, Api } = require('../../dist');
const { JsonRpc, RpcError, Api } = require('eosjs/dist');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const fetch = require('node-fetch');
const { TextEncoder, TextDecoder } = require('util');

const user = {
    privateKey: '',
    publicKey: '',
    account: '',
    domain: '',  // The domain you want to register
    address: ''  // The address you want to register
  }


const privateKey = ''; // replace with "bob" account private key
/* new accounts for testing can be created by unlocking a cleos wallet then calling: 
 * 1) cleos create key --to-console (copy this privateKey & publicKey)
 * 2) cleos wallet import 
 * 3) cleos create account bob publicKey
 * 4) cleos create account alice publicKey
 */

const rpc = new JsonRpc('http://localhost:8889', { fetch });
const signatureProvider = new JsSignatureProvider([privateKey]);
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

const ebtest = async () => await api.transact({
    actions: [{
        account: 'fio.address',
        name: 'regdomain',
        authorization: [{
            actor: user.account,
            permission: 'active',
        }],
        data: {
            fio_domain: user.domain,
            owner_fio_public_key: user.publicKey,
            max_fee: 800000000000,
            tpid: 'rewards@wallet',
            actor: user.account,
        },
    }]
}, {
    blocksBehind: 3,
    expireSeconds: 30,
});


const transactWithConfig = async () => await api.transact({
    actions: [{
        account: 'eosio.token',
        name: 'transfer',
        authorization: [{
            actor: 'bob',
            permission: 'active',
        }],
        data: {
            from: 'bob',
            to: 'alice',
            quantity: '0.0001 SYS',
            memo: '',
        },
    }]
}, {
    blocksBehind: 3,
    expireSeconds: 30,
});

const transactWithoutConfig = async () => {
    const transactionResponse = await transactWithConfig();
    const blockInfo = await rpc.get_block(transactionResponse.processed.block_num - 3);
    const currentDate = new Date();
    const timePlusTen = currentDate.getTime() + 10000;
    const timeInISOString = (new Date(timePlusTen)).toISOString();
    const expiration = timeInISOString.substr(0, timeInISOString.length - 1);

    return await api.transact({
        expiration,
        ref_block_num: blockInfo.block_num & 0xffff,
        ref_block_prefix: blockInfo.ref_block_prefix,
        actions: [{
            account: 'eosio.token',
            name: 'transfer',
            authorization: [{
                actor: 'bob',
                permission: 'active',
            }],
            data: {
                from: 'bob',
                to: 'alice',
                quantity: '0.0001 SYS',
                memo: '',
            },
        }]
    });
};
    

const transactWithoutBroadcast = async () => await api.transact({
  actions: [{
        account: 'eosio.token',
        name: 'transfer',
        authorization: [{
            actor: 'bob',
            permission: 'active',
        }],
        data: {
            from: 'bob',
            to: 'alice',
            quantity: '0.0001 SYS',
            memo: '',
        },
    }]
}, {
    broadcast: false,
    blocksBehind: 3,
    expireSeconds: 30,
});

const broadcastResult = async (signaturesAndPackedTransaction) => await api.pushSignedTransaction(signaturesAndPackedTransaction);

const transactShouldFail = async () => await api.transact({
    actions: [{
        account: 'eosio.token',
        name: 'transfer',
        authorization: [{
            actor: 'bob',
            permission: 'active',
        }],
        data: {
            from: 'bob',
            to: 'alice',
            quantity: '0.0001 SYS',
            memo: '',
        },
    }]
});
  
const rpcShouldFail = async () => await rpc.get_block(-1);

ebtest();
/*
module.exports = {
    transactWithConfig,
    transactWithoutConfig,
    transactWithoutBroadcast,
    broadcastResult,
    transactShouldFail,
    rpcShouldFail
};
*/
