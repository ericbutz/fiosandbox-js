require('mocha')
const {expect} = require('chai')
const {existingUser, callFioApi} = require('../utils.js');
const {FIOSDK } = require('@fioprotocol/FIOSDK')
config = require('../config.js');

let user1

//Testnet Account
before(async () => {
  user1 = await existingUser('', '', '', '', '');
})

describe('Use up bundles', () => {

  it(`Use up all of user1's bundles with 51 record_obt_data transactions`, async () => {
    for (i = 0; i < 51; i++) {
      try {
        const result = await user1.sdk.genericAction('recordObtData', {
          payerFioAddress: user1.address,
          payeeFioAddress: 'eric1@fiotestnet',
          payerTokenPublicAddress: 'qewrqerqewrqwer',
          payeeTokenPublicAddress: 'adsfadsfasdfasdf',
          amount: 50000000,
          chainCode: "ACME",
          tokenCode: "ACME",
          status: '',
          obtId: '',
          maxFee: config.api.record_obt_data.fee,
          technologyProviderId: '',
          payeeFioPublicKey: user1.publicKey,
          memo: 'test',
          hash: '',
          offLineUrl: ''
        })
        console.log('Result: ', result)
        expect(result.status).to.equal('sent_to_blockchain')
      } catch (err) {
        console.log('Error', err.json)
        expect(err).to.equal(null)
      }
    }
  })

  it(`Get balance for user1`, async () => {
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