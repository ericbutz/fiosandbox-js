config = require ('./config');

const rp = require('request-promise');
const exec = require('child_process').exec;
//const url = "http://localhost:8889";
const fiourl = config.URL + "/v1/chain/";
const KeosdUrl = config.URL + "/v1/chain/";
const historyUrl = config.URL + "/v1/history/"
const clio = "../fio.devtools/bin/clio";
var fs = require('fs');

const { Fio } = require('@fioprotocol/fiojs');
fetch = require('node-fetch');
const {FIOSDK } = require('@fioprotocol/FIOSDK')
const Transactions_2 = require("@fioprotocol/FIOSDK/lib/transactions/Transactions")
let transaction = new Transactions_2.Transactions

function randStr(len) {
    var charset = "abcdefghijklmnopqrstuvwxyz"; 
    result="";
    for( var i=0; i < len; i++ )
        result += charset[Math.floor(Math.random() * charset.length)];
    return result
}

function convertToK1(pubkey) {
    return pubkey.replace("FIO", "PUB_K1_");
}

function user(account, privateKey, publicKey) {
    this.account = account;
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.ramUsage = [];
}

function getMnemonic() {
    //randStr = Math.random().toString(26).substr(2, 8)
    return 'test health mine over uncover someone gain powder urge slot property ' + randStr(7)
}


async function fetchJson(uri, opts = {}) {
    return fetch(uri, opts)
}

async function timeout(ms) {
    await new Promise(resolve => {
      setTimeout(resolve, ms)
    })
}

function generateFioDomain(size) {
    return randStr(size)
}

function generateFioAddress(customDomain = config.DEFAULT_DOMAIN, size) {
    try {
        if (size + customDomain.length < config.paramMax.fio_address) {
            name = randStr(size)
        } else {
            name = randStr(config.paramMax.fio_address - customDomain.length - 1)
        }
        return name + '@' + customDomain
    } catch (err) {
        console.log('Error: ', err)
    }
}

async function createKeypair() {
    let privateKeyRes = await FIOSDK.createPrivateKeyMnemonic(getMnemonic())
    privateKey = privateKeyRes.fioKey
    let publicKeyRes = FIOSDK.derivedPublicKey(privateKey)
    publicKey = publicKeyRes.publicKey
    account = transaction.getActor(publicKey)
    return {
        privateKey: privateKey,
        publicKey: publicKey,
        account: account
      };
}

async function getAccountFromKey(publicKey) {
    account = transaction.getActor(publicKey)
    return (account);
}

//Creates a user and registers an address and domain
async function newUser(faucet, newAccount=null, newPrivateKey=null, newPublicKey=null, newDomain=null, newAddress=null) {
    if (newAccount != null) {
        this.account = newAccount;
        this.privateKey = newPrivateKey;
        this.publicKey = newPublicKey;
        this.domain = newDomain;
        this.address = newAddress;
    } else {
        keys = await createKeypair();
        this.account = keys.account;
        this.privateKey = keys.privateKey;
        this.publicKey = keys.publicKey;
        this.domain = generateFioDomain(10);
        this.address = generateFioAddress(this.domain, 5);
    }
    this.ramUsage = [];
    this.sdk = new FIOSDK(this.privateKey, this.publicKey, config.BASE_URL, fetchJson);
    this.lockAmount = 0;
    this.lockType = 0;

    try {
        const result = await faucet.genericAction('transferTokens', {
            payeeFioPublicKey: this.publicKey,
            amount: config.FUNDS,
            maxFee: config.api.transfer_tokens_pub_key.fee,
        })  
        //console.log('Result', result)
        //expect(result.status).to.equal('OK')  
    } catch (err) {
        console.log('Transfer tokens error: ', err.json)
        return(err);
    }  

    try {
        const result1 = await this.sdk.genericAction('isAvailable', {fioName: this.domain})
        if ( ! result1.is_registered ) {
            const result = await this.sdk.genericAction('registerFioDomain', { 
                fioDomain: this.domain, 
                maxFee: config.api.register_fio_domain.fee ,
                walletFioAddress: ''
              })
              //console.log('Result', result)
              //expect(result.status).to.equal('OK') 
        }
    } catch (err) {
        console.log('registerFioDomain error: ', err.json)
        return(err);
    } 

    try {
        const result1 = await this.sdk.genericAction('isAvailable', {fioName: this.address})
        if ( ! result1.is_registered ) {
            const result = await this.sdk.genericAction('registerFioAddress', { 
                fioAddress: this.address,
                maxFee: config.api.register_fio_address.fee,
                walletFioAddress: ''
            })
            //console.log('Result: ', result)
            //expect(result.status).to.equal('OK')  
        }
    } catch (err) {
        console.log('registerFioAddress error: ', err.json)
        return(err);
    } 

    try {
        const result = await this.sdk.genericAction('getFioBalance', {
          fioPublicKey: this.publicKey
        }) 
        this.fioBalance = result.balance;
        //console.log('foundationA1 fio balance', result)
        //expect(result.balance).to.equal(proxyA1.last_vote_weight)
      } catch (err) {
        console.log('getFioBalance Error', err);
      }
   
    return {
        privateKey: this.privateKey,
        publicKey: this.publicKey,
        account: this.account,
        ramUsage: this.ramUsage,
        sdk: this.sdk,
        domain: this.domain,
        address: this.address,
        fioBalance: this.fioBalance,
        lockAmount: this.lockAmount,
        lockType: this.lockType
      };
}

//Creates the user object for an account that already exists
async function existingUser(caccount, cprivateKey, cpublicKey, cdomain=null, caddress=null) {
    this.account = caccount;
    this.privateKey = cprivateKey;
    this.publicKey = cpublicKey;
    this.domain = cdomain
    this.address = caddress
    this.ramUsage = [];
    this.sdk = new FIOSDK(this.privateKey, this.publicKey, config.BASE_URL, fetchJson);
    this.lockAmount = 0;
    this.lockType = 0;

    try {
        if (cdomain == null) {
            const result = await this.sdk.genericAction('registerFioDomain', { 
                fioDomain: this.domain, 
                maxFee: config.api.register_fio_domain.fee ,
                walletFioAddress: ''
              })
        }
    } catch (err) {
        console.log('Register domain error: ', err.json)
        return(err);
    } 

    try {
        if (caddress == null) {
            const result = await this.sdk.genericAction('registerFioAddress', { 
                fioAddress: this.address,
                maxFee: config.api.register_fio_address.fee,
                walletFioAddress: ''
            })
        }
    } catch (err) {
        console.log('Register address error: ', err.json)
        return(err);
    } 

    try {
        const result = await this.sdk.genericAction('getFioBalance', {
          fioPublicKey: this.publicKey
        }) 
        this.fioBalance = result.balance;
        //console.log('foundationA1 fio balance', result)
        //expect(result.balance).to.equal(proxyA1.last_vote_weight)
      } catch (err) {
        console.log('Error', err);
      }
   
    return {
        privateKey: this.privateKey,
        publicKey: this.publicKey,
        account: this.account,
        ramUsage: this.ramUsage,
        sdk: this.sdk,
        domain: this.domain,
        address: this.address,
        fioBalance: this.fioBalance,
        lockAmount: this.lockAmount,
        lockType: this.lockType
      };
}

/**
 * Generic, unsigned call to API
 * @param {string} apiCall - The FIO API endpoint.
 * @param {json} JSONObject - The json body to pass to the endpoint.
 * @return {json} - Returns json object.
 */
function callFioApi(apiCall, JSONObject) {
    return (new Promise(function(resolve, reject) {
        var options = {
            method: "POST",
            uri: fiourl + apiCall,
            body: JSONObject,
            json: true // Automatically stringifies the body to JSON
        };

        rp(options)
            .then(function (body){
                //console.log(body);
                resolve(body);
            }).catch(function(ex) {
                reject(ex);
            });
    }));
};

/**
 * Generic call to API that requires packed/signed transaction
 * @param {string} endPoint - The FIO API endpoint.
 * @param {json} txn - The json FIO transaction data that will be packed and signed.
 * @return {json} - Returns json object.
 */
const callFioApiSigned = async (endPoint, txn) => {
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

/**
 * Generic call to History API
 * @param {string} apiCall - The FIO API endpoint.
 * @param {json} JSONObject - The json body to pass to the endpoint.
 * @return {json} - Returns json object.
 */
function callFioHistoryApi(apiCall, JSONObject) {
    return (new Promise(function(resolve, reject) {
        var options = {
            method: "POST",
            uri: historyUrl + apiCall,
            body: JSONObject,
            json: true // Automatically stringifies the body to JSON
        };
        //console.log("\nCalling: " + options.uri);
        //console.log("\nWith stringified JSON: \n")
        //console.log(JSON.stringify(options.body));
        rp(options)
            .then(function (body){
                //console.log("\nAPI call result: \n");
                //console.log(body);
                resolve(body);
            }).catch(function(ex) {
                reject(ex);
            });
    }));
};

/**
 * Returns an array of fees from the fiofees table.
 * @returns {Array} array[end_point] = suf_amount
 */
async function getFees() {
    return new Promise(function(resolve, reject) {
        let fees = [];
        const json = {
            json: true,
            code: 'fio.fee', 
            scope: 'fio.fee',
            table: 'fiofees',
            limit: 1000,
            reverse: false,
            show_payer: false
        }
        callFioApi("get_table_rows", json)
        .then(result => { 
            var i;
            for (i = 0; i < result.rows.length; i++) {
                fees[result.rows[i].end_point] = result.rows[i].suf_amount
            }
            resolve(fees)
        }).catch(error => {
            console.log('Error: ', error)
            reject(error)
        });
    });
}

async function setRam(user, txnType, fee) {
    return new Promise(function(resolve, reject) {
        let ramEntry
        const json = {
            account_name: user.account,
        }
        callFioApi("get_account", json)
        .then(result => { 
            ramEntry = {
                txnType: txnType,
                fee: fee,
                txnQuota: config.RAM[txnType],
                actualRamUsage: result.ram_usage, 
                actualRamQuota: result.ram_quota, 
                expectedRamQuota: config.RAM[txnType]
            }
            user.ramUsage.push(ramEntry);
            resolve()
        }).catch(error => {
            console.log('Error: ', error)
            reject(error)
        });
        
    });
}

async function printUserRam(user) {
    let entry, fee, type, txnQuota, actualRamQuota, deltaRamQuota, actualRamUsage, deltaActualRamUsage

    console.log('RAM Usage for: ', user.account)    
    console.log('type' + '\t' + 'feeCollected' + '\t' + 'txnQuota' + '\t' + 'actualRamQuota' + '\t' + 'deltaRamQuota' + '\t' + 'actualRAMUsage' + '\t' + 'deltaActualRAMUsage')

    for (entry in user.ramUsage) {
        type = user.ramUsage[entry].txnType
        fee = user.ramUsage[entry].fee
        txnQuota = user.ramUsage[entry].txnQuota
        actualRamQuota = user.ramUsage[entry].actualRamQuota
        deltaRamQuota = actualRamQuota - txnQuota
        actualRamUsage = user.ramUsage[entry].actualRamUsage
        if (entry>0) {
            deltaActualRamUsage = actualRamUsage - user.ramUsage[entry-1].actualRamUsage
        } else {
            deltaActualRamUsage = 0
        }
        console.log(type + '\t' + fee  + '\t' + txnQuota + '\t' + actualRamQuota + '\t' + deltaRamQuota + '\t' + actualRamUsage + '\t' + deltaActualRamUsage)
    }
}

async function getTotalVotedFio() {
    return new Promise(function(resolve, reject) {

        const json = {
            json: true,
            code: 'eosio', 
            scope: 'eosio',
            table: 'global',
            limit: 1000,
            reverse: false,
            show_payer: false
        }
        callFioApi("get_table_rows", json)
        .then(result => { 
            resolve(result.rows[0].total_voted_fio)
        }).catch(error => {
            console.log('Error: ', error)
            reject(error)
        });
    });
}

async function getProdVoteTotal(producer) {
    return new Promise(function(resolve, reject) {
        const json = {
            json: true,
            code: 'eosio', 
            scope: 'eosio',
            table: 'producers',
            limit: 1000,
            reverse: false,
            show_payer: false
        }
        callFioApi("get_table_rows", json)
        .then(result => { 
            for (prod in result.rows) {
                 if (result.rows[prod].fio_address == producer) { 
                    resolve(Math.floor(result.rows[prod].total_votes))
                    break; 
                }
            }
            resolve(null)
        }).catch(error => {
            console.log('Error: ', error)
            reject(error)
        });
    });
}

async function getAccountVoteWeight(account) {
    return new Promise(function(resolve, reject) {
        const json = {
            json: true,
            code: 'eosio', 
            scope: 'eosio',
            table: 'voters',
            limit: 1000,
            reverse: false,
            show_payer: false
        }
        callFioApi("get_table_rows", json)
        .then(result => { 
            for (voterID in result.rows) {
                 if (result.rows[voterID].owner == account) { 
                    resolve(Math.floor(result.rows[voterID].last_vote_weight))
                    break; 
                }
            }
            resolve(null)
        }).catch(error => {
            console.log('Error: ', error)
            reject(error)
        });
    });
}



async function addLock(account, amount, lock) {
    return new Promise(function(resolve, reject) {
        var text = {owner: account, amount: amount, locktype: lock}
        text = JSON.stringify(text)
        runCmd(config.CLIO + " push action -j eosio addlocked '" + text + "' -p eosio@active")
         .then(result => { 
            let jResult = JSON.parse(result);
            account.lockAmount = amount;
            account.lockType = lock;
            resolve(jResult)
        }).catch(error => {
            console.log('Error: ', error)
            reject(error)
        });
    });
}

async function unlockWallet(wallet) {
    return new Promise(function(resolve, reject) {
        runCmd(config.CLIO + " wallet list")
        .then(result => { 
            let walletLock = result.indexOf(wallet + " *")          
            if (walletLock == -1 ) {  // Wallet is not unlocked
                runCmd(config.CLIO + " wallet unlock -n " + wallet + " --password " + config.WALLETKEY)
            } 
            resolve()
        }).catch(error => {
            console.log('Error: ', error)
            reject(error)
        });
    });
}


function runCmd(command) {
    return new Promise(function(resolve, reject) {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout.trim());
        });
    });
}


async function getTopprods() {
    return new Promise(function(resolve, reject) {
        runCmd(config.CLIO + " get table -l -1 eosio eosio topprods")
        .then(result => { 
            let jresult = JSON.parse(result) 
            //console.log("jresult", jresult.rows[0])
            resolve(jresult)
        }).catch(error => {
            console.log('Error: ', error)
            reject(error)
        });
    });
}


module.exports = {newUser, existingUser, getTopprods, callFioApi, callFioApiSigned, callFioHistoryApi, convertToK1, unlockWallet, getFees, getAccountFromKey, getProdVoteTotal, addLock, getTotalVotedFio, getAccountVoteWeight, setRam, printUserRam, user, getMnemonic, fetchJson, randStr, timeout, generateFioDomain, generateFioAddress, createKeypair};

