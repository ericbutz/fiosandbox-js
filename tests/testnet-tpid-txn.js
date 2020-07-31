require('mocha')
const {expect} = require('chai')
const {newUser, existingUser, callFioApiSigned} = require('../utils.js');
const {FIOSDK } = require('@fioprotocol/FIOSDK')
config = require('../config.js');

let user1

before(async () => {
  user1 = await existingUser('', '', '', '', '');
})

describe(`TPID`, () => {

  it.skip(`Register FIO Domain with TPID`, async () => {
    try {
      const result = await user1.sdk.genericAction('registerFioDomain', { 
        fioDomain: 'ebtest4', 
        maxFee: config.api.register_fio_domain.fee,
        technologyProviderId: user1.address
      })   
      console.log('Result: ', result)
      expect(result.status).to.equal('OK')
    } catch (err) {
      console.log('Error: ', err.json)
    }
  })

  it(`TPID Claim`, async () => {
    const result = await callFioApiSigned('push_transaction', {
      action: 'tpidclaim',
      account: 'fio.treasury',
      actor: user1.account,
      privKey: user1.privateKey,
      data: {
        actor: user1.account
      }
    })
     console.log('Result: ', result)
     //expect(result.processed.receipt.status).to.equal('executed');
  })

})
