require('mocha')
const {expect} = require('chai')
const {existingUser, callFioApi} = require('../utils.js');
const {FIOSDK } = require('@fioprotocol/FIOSDK')
config = require('../config.js');

let user1

//Testnet Account
before(async () => {
  user1 = await existingUser('ylecmt24ixuj', '5J7Jx7FLrkjMrMgizSBuEDuUvcj4XaVRoc3vVwLsHhprGXpGeBz', 'FIO5N9wfnhsHaoE9g5BU6FpRaQLBnjnrPtqJLhdMpi8WZM1tQfWQ6', 'edge', 'eric1bundle@edge');  //caccount, cprivateKey, cpublicKey, cdomain=null, caddress=null
})

describe('Use up bundles', () => {

  it.skip(`Request funds from other user to use up funds`, async () => {
    for (i = 0; i < 51; i++) {
      try {
        const result = await user1.sdk.genericAction('requestFunds', { 
          payerFioAddress: 'ericfree@edge', 
          payeeFioAddress: user1.address,
          payeeTokenPublicAddress: user1.publicKey,
          amount: 500000000,
          chainCode: 'BTC',
          tokenCode: 'BTC',
          memo: '',
          maxFee: config.api.new_funds_request.fee,
          payerFioPublicKey: 'FIO4zouEPAZ2KmnNEmjNfi1MjGCv1QAXjnZucQLaUoUr7dneLdcx7',
          technologyProviderId: '',
          hash: '',
          offLineUrl: ''
        })    
        //console.log('Result: ', result)
        userA1RequestId = result.fio_request_id
        expect(result.status).to.equal('requested') 
      } catch (err) {
        console.log('Error: ', err)
        expect(err).to.equal(null)
      }
    }
  })

  it(`Use addaddress to use up funds`, async () => {
    for (i = 0; i < 95; i++) {
      try {
        const result = await callFioApiSigned('push_transaction', {
          action: 'addaddress',
          account: 'fio.address',
          actor: user1.account,
          privKey: user1.privateKey,
          data: {
            "fio_address": user1.address,
            "public_addresses": [
              {
                chain_code: 'BCH',
                token_code: 'BCH',
                public_address: 'bitcoincash:qzf8zha74ahdh9j0xnwlffdn0differentaddress',
              }
            ],
            "max_fee": config.api.add_pub_address.fee,
            "tpid": '',
            "actor": user1.account
          }
        })
        console.log('Result: ', result)
      } catch (err) {
        console.log('Error: ', err)
        expect(err).to.equal(null)
      }
    }
  })

  it.skip(`Get balance for user1`, async () => {
    try {
      const result = await user1.sdk.genericAction('getFioBalance', {
        fioPublicKey: user1.publicKey
      }) 
      userC1Balance = result.balance
      //console.log('user1 fio balance', result)
    } catch (err) {
      //console.log('Error', err)
      expect(err).to.equal(null)
    }
  })

  it('Call get_table_rows from fionames to get bundles remaining for user1. Verify 0 bundles', async () => {
    let bundleCount
    try {
      const json = {
        json: true,               // Get the response as json
        code: 'fio.address',      // Contract that we target
        scope: 'fio.address',         // Account that owns the data
        table: 'fionames',        // Table name
        limit: 1000,                // Maximum number of rows that we want to get
        reverse: false,           // Optional: Get reversed data
        show_payer: false          // Optional: Show ram payer
      }
      fionames = await callFioApi("get_table_rows", json);
      //console.log('fionames: ', fionames);
      for (name in fionames.rows) {
        if (fionames.rows[name].name == user1.address) {
          //console.log('bundleeligiblecountdown: ', fionames.rows[name].bundleeligiblecountdown); 
          bundleCount = fionames.rows[name].bundleeligiblecountdown;
        }
      }
      expect(bundleCount).to.equal(0);  
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

})