require('mocha')
const {expect} = require('chai')
const {existingUser, fetchJson} = require('../utils.js');
const {FIOSDK } = require('@fioprotocol/FIOSDK')
config = require('../config.js');

before(async () => {
  faucet = new FIOSDK(config.FAUCET_PRIV_KEY, config.FAUCET_PUB_KEY, config.BASE_URL, fetchJson);
})

describe(`************************** single-request.js **************************`, () => {

    let user1
    const fundsAmount = 3

    it(`Create users`, async () => {
      user1 = await existingUser('', '', '', '', '');
 
    })
  
    it(`Send FIO Request`, async () => {
      try {
        const result = await user1.sdk.genericAction('requestFunds', { 
          payerFioAddress: '', 
          payeeFioAddress: '',
          payeeTokenPublicAddress: '',
          amount: fundsAmount,
          chainCode: '',
          tokenCode: '',
          memo: 'For computer',
          maxFee: 80000000000,
          payerFioPublicKey: ''
        })    
        console.log('Result: ', result)
        //expect(result.status).to.equal('requested') 
      } catch (err) {
        console.log('Error: ', err)
        expect(err).to.equal(null)
      }
    })

})




