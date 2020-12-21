require('mocha')
const {expect} = require('chai')
const {newUser, fetchJson, callFioApi, callFioApiSigned, randStr, timeout} = require('../utils.js');
const {FIOSDK } = require('@fioprotocol/FIOSDK')
config = require('../config.js');

before(async () => {
  faucet = new FIOSDK(config.FAUCET_PRIV_KEY, config.FAUCET_PUB_KEY, config.BASE_URL, fetchJson);
})

describe(`************************** addaddress.js ************************** \n A. Add 2 addresses, then add 3 addresses including the original 2`, () => {

    let userA1

    it(`Create users`, async () => {
        userA1 = await newUser(faucet);
    })

    it(`Add DASH and BCH addresses to userA1`, async () => {
      try {
        const result = await userA1.sdk.genericAction('addPublicAddresses', {
          fioAddress: userA1.address,
          publicAddresses: [
            {
              chain_code: 'BCH',
              token_code: 'BCH',
              public_address: 'bitcoincash:qzf8zha74ahdh9j0xnwlffdn0zuyaslx3c90q7n9g9',
            },
            {
              chain_code: 'DASH',
              token_code: 'DASH',
              public_address: 'XyCyPKzTWvW2XdcYjPaPXGQDCGk946ywEv',
            }
          ],
          maxFee: config.api.add_pub_address.fee,
          technologyProviderId: ''
        })
        //console.log('Result:', result)
        expect(result.status).to.equal('OK')
      } catch (err) {
        console.log('Error', err)
        //expect(err).to.equal(null)
      }
    })

    //it(`Wait to avoid timing errors.`, async () => { await timeout(1000) })

    it('getPublicAddress for DASH', async () => {
      try {
        const result = await userA1.sdk.genericAction('getPublicAddress', {
          fioAddress: userA1.address,
          chainCode: "DASH",
          tokenCode: "DASH"
        })
        //console.log('Result', result)
        expect(result.public_address).to.equal('XyCyPKzTWvW2XdcYjPaPXGQDCGk946ywEv')
      } catch (err) {
        //console.log('Error', err)
        expect(err).to.equal(null)
      }
    })

    it('getPublicAddress for BCH', async () => {
      try {
        const result = await userA1.sdk.genericAction('getPublicAddress', {
          fioAddress: userA1.address,
          chainCode: "BCH",
          tokenCode: "BCH"
        })
        //console.log('Result', result)
        expect(result.public_address).to.equal('bitcoincash:qzf8zha74ahdh9j0xnwlffdn0zuyaslx3c90q7n9g9')
      } catch (err) {
        console.log('Error', err)
      }
    })

    it(`Re-add DASH and BCH addresses plus additional ELA address to userA1`, async () => {
      try {
        const result = await userA1.sdk.genericAction('addPublicAddresses', {
          fioAddress: userA1.address,
          publicAddresses: [
            {
              chain_code: 'BCH',
              token_code: 'BCH',
              public_address: 'bitcoincash:qzf8zha74ahdh9j0xnwlffdn0zuyaslx3c90q7n9g9',
            },
            {
              chain_code: 'DASH',
              token_code: 'DASH',
              public_address: 'XyCyPKzTWvW2XdcYjPaPXGQDCGk946ywEv',
            },
            {
              chain_code: 'ELA',
              token_code: 'ELA',
              public_address: 'EQH6o4xfaR5fbhV8cDbDGRxwJRJn3qeo41',
            }
          ],
          maxFee: config.api.add_pub_address.fee,
          technologyProviderId: ''
        })
        //console.log('Result:', result)
        expect(result.status).to.equal('OK')
      } catch (err) {
        console.log('Error', err)
        expect(err).to.equal(null)
      }
    })

    it('getPublicAddress for ELA', async () => {
      try {
        const result = await userA1.sdk.genericAction('getPublicAddress', {
          fioAddress: userA1.address,
          chainCode: "ELA",
          tokenCode: "ELA"
        })
        //console.log('Result', result)
        expect(result.public_address).to.equal('EQH6o4xfaR5fbhV8cDbDGRxwJRJn3qeo41')
      } catch (err) {
        console.log('Error', err)
        expect(err).to.equal(null)
      }
    })

    it('removeAllPublicAddresses', async () => {
      try {
        const result = await userA1.sdk.genericAction('removeAllPublicAddresses', {
          fioAddress: userA1.address,
          maxFee: config.api.add_pub_address.fee,
          technologyProviderId: ''
        })
        //console.log('Result', result)
        expect(result.status).to.equal('OK')
      } catch (err) {
        console.log('Error', err)
        expect(err).to.equal(null)
      }
    })

})

describe(`B. Add the same address twice`, () => {

  let userB1

  it(`Create users`, async () => {
      userB1 = await newUser(faucet);
  })

  it(`Add DASH and BCH addresses to userB1`, async () => {
    const result = await userB1.sdk.genericAction('addPublicAddresses', {
      fioAddress: userB1.address,
      publicAddresses: [
        {
          chain_code: 'BCH',
          token_code: 'BCH',
          public_address: 'bitcoincash:qzf8zha74ahdh9j0xnwlffdn0zuyaslx3c90q7n9g9',
        }
      ],
      maxFee: config.api.add_pub_address.fee,
      walletFioAddress: ''
    })
    //console.log('Result:', result)
    expect(result.status).to.equal('OK')
  })

  it('getPublicAddress for BCH', async () => {
    try {
      const result = await userB1.sdk.genericAction('getPublicAddress', {
        fioAddress: userB1.address,
        chainCode: "BCH",
        tokenCode: "BCH"
      })
      //console.log('Result', result)
      expect(result.public_address).to.equal('bitcoincash:qzf8zha74ahdh9j0xnwlffdn0zuyaslx3c90q7n9g9')
    } catch (err) {
      console.log('Error', err)
    }
  })

  it(`Re-add BCH address`, async () => {
    try {
      const result = await userB1.sdk.genericAction('addPublicAddresses', {
        fioAddress: userB1.address,
        publicAddresses: [
          {
            chain_code: 'BCH',
            token_code: 'BCH',
            public_address: 'bitcoincash:qzf8zha74adsfasdf0xnwlffdn0zuyaslx3c90q7n9g9',
          }
        ],
        maxFee: config.api.add_pub_address.fee,
        walletFioAddress: ''
      })
      //console.log('Result:', result)
      expect(result.status).to.equal('OK')
    } catch (err) {
      console.log('Error', err)
    }
  })

  it('getPublicAddress for BCH', async () => {
    try {
      const result = await userB1.sdk.genericAction('getPublicAddress', {
        fioAddress: userB1.address,
        chainCode: "BCH",
        tokenCode: "BCH"
      })
      //console.log('Result', result)
      expect(result.public_address).to.equal('bitcoincash:qzf8zha74adsfasdf0xnwlffdn0zuyaslx3c90q7n9g9')
    } catch (err) {
      console.log('Error', err)
    }
  })

})

describe(`C. Get_pub_addresses endpoint`, () => {

    let userA3

    it(`Create users`, async () => {
        userA3 = await newUser(faucet);
    })

    it(`Add DASH, BCH, ELA address to userA3`, async () => {
      try {
        const result = await userA3.sdk.genericAction('addPublicAddresses', {
          fioAddress: userA3.address,
          publicAddresses: [
            {
              chain_code: 'BCH',
              token_code: 'BCH',
              public_address: 'bitcoincash:qzf8zha74ahdh9j0xnwlffdn0zuyaslx3c90q7n9g9',
            },
            {
              chain_code: 'DASH',
              token_code: 'DASH',
              public_address: 'XyCyPKzTWvW2XdcYjPaPXGQDCGk946ywEv',
            },
            {
              chain_code: 'ELA',
              token_code: 'ELA',
              public_address: 'EQH6o4xfaR5fbhV8cDbDGRxwJRJn3qeo41',
            }
          ],
          maxFee: config.api.add_pub_address.fee,
          technologyProviderId: ''
        })
        //console.log('Result:', result)
        expect(result.status).to.equal('OK')
      } catch (err) {
        console.log('Error', err)
        expect(err).to.equal(null)
      }
    })

    it('Get all public addresses for userA3 FIO Address (get_pub_addresses)', async () => {
      try {
          const result = await callFioApi("get_pub_addresses", {
          fio_address: userA3.address,
          limit: 10,
          offset: 0
        })
      //  console.log('Result', result)
        expect(result.public_addresses.length).to.equal(4)
        expect(result.public_addresses[0].token_code).to.equal("FIO");
        expect(result.public_addresses[1].public_address).to.equal("bitcoincash:qzf8zha74ahdh9j0xnwlffdn0zuyaslx3c90q7n9g9");
        expect(result.public_addresses[1].token_code).to.equal("BCH");
        expect(result.public_addresses[1].chain_code).to.equal("BCH");
        expect(result.public_addresses[2].public_address).to.equal("XyCyPKzTWvW2XdcYjPaPXGQDCGk946ywEv");
        expect(result.public_addresses[2].token_code).to.equal("DASH");
        expect(result.public_addresses[2].chain_code).to.equal("DASH");
        expect(result.public_addresses[3].public_address).to.equal("EQH6o4xfaR5fbhV8cDbDGRxwJRJn3qeo41");
        expect(result.public_addresses[3].token_code).to.equal("ELA");
        expect(result.public_addresses[3].chain_code).to.equal("ELA");
        expect(result.more).to.equal(false);
      } catch (err) {
        console.log('Error', err)
      }
    })

    //***** SAD TESTS *****//

    it('Call get_pub_addresses with invalid FIO Address', async () => {
      try {
          const result = await callFioApi("get_pub_addresses", {
          fio_address: "intentionallybadformat@@@@@******",
          limit: 10,
          offset: 0
        })
        //console.log('Result', result)
        expect(result.status).to.equal(null);
      } catch (err) {
      //  console.log('Error', err)
        expect(err.statusCode).to.equal(400);
        expect(err.error.fields[0].error).to.equal("Invalid FIO Address");
      }
    })


    it('Call get_pub_addresses with unregistered FIO Address', async () => {
      try {
          const result = await callFioApi("get_pub_addresses", {
          fio_address: "eric@likesbeans",
          limit: 10,
          offset: 0
        })
        //console.log('Result', result)
        expect(result.status).to.equal(null);
      } catch (err) {
        //console.log('Error', err)
        expect(err.statusCode).to.equal(404);
        expect(err.error.message).to.equal("Public address not found");
      }
    })

    it('Call get_pub_addresses with invalid limit parameter of -1', async () => {
      try {
          const result = await callFioApi("get_pub_addresses", {
          fio_address: userA3.address,
          limit: -1,
          offset: 0
        })
        //console.log('Result', result)
        expect(result.status).to.equal(null);
      } catch (err) {
      //  console.log('Error', err)
        expect(err.statusCode).to.equal(400);
        expect(err.error.fields[0].error).to.equal("Invalid limit");
      }
    })

    it('Call get_pub_addresses with invalid offset parameter of -1', async () => {
      try {
          const result = await callFioApi("get_pub_addresses", {
          fio_address: userA3.address,
          limit:  10,
          offset: -1
        })
        //console.log('Result', result)
        expect(result.status).to.equal(null);
      } catch (err) {
        //console.log('Error', err)
        expect(err.statusCode).to.equal(400);
        expect(err.error.fields[0].error).to.equal("Invalid offset");
      }
    })

    it('removeAllPublicAddresses', async () => {
      try {
        const result = await userA3.sdk.genericAction('removeAllPublicAddresses', {
          fioAddress: userA3.address,
          maxFee: config.api.add_pub_address.fee,
          technologyProviderId: ''
        })
        //console.log('Result', result)
        expect(result.status).to.equal('OK')
      } catch (err) {
        console.log('Error', err)
        expect(err).to.equal(null)
      }
    })

    it('Get all public addresses for userA3 FIO Address (get_pub_addresses)', async () => {
      try {
          const result = await callFioApi("get_pub_addresses", {
          fio_address: userA3.address,
          limit: 10,
          offset: 0
        })
      //  console.log('Result', result)
        expect(result.public_addresses[0].token_code).to.equal("FIO")
        expect(result.public_addresses[0].chain_code).to.equal("FIO")
        expect(result.public_addresses.length).to.equal(1)

      } catch (err) {
        console.log('Error', err)
        expect(err).to.equal(null)
      }
    })

})

describe.only(`Test adding and getting 200 addresses`, () => {
  let user1, foundAddresses;
  const totalAddresses = 200;  //Make it divisible by 5
  const loopCount = totalAddresses / 5;

  it(`Create users`, async () => {
      user1 = await newUser(faucet);
      console.log("Address", user1.address);
  })

  it(`Renew address x 5`, async () => {
    for (i = 0; i < 4; i++) {
      try {
        const result = await callFioApiSigned('push_transaction', {
          action: 'renewaddress',
          account: 'fio.address',
          actor: user1.account,
          privKey: user1.privateKey,
          data: {
            fio_address: user1.address,
            max_fee: config.api.renew_fio_address.fee,
            tpid: '',
            actor: user1.account
          }
        });
        //console.log('Result', result);
      } catch (err) {
        console.log('Error', err)
        expect(err).to.equal(null)
      }
      await timeout(1000);
    }
  })

  it('Call get_table_rows from fionames to get bundles remaining for user1.', async () => {
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
        console.log('Bundle count: ', bundleCount)
        //expect(bundleCount).to.equal(0);
    } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
    }
})

  it(`Add ${totalAddresses} - 5 addresses to userA1`, async () => {
    for (i = 0; i < totalAddresses - 5; i++) {
      try {
        const result = await callFioApiSigned('push_transaction', {
          action: 'addaddress',
          account: 'fio.address',
          actor: user1.account,
          privKey: user1.privateKey,
          data: {
            fio_address: user1.address,
            public_addresses: [
              {
                chain_code: i,
                token_code: i,
                public_address: randStr(20),
              },
              {
                chain_code: i + loopCount,
                token_code: i + loopCount,
                public_address: randStr(20),
              },
              {
                chain_code: i + loopCount*2,
                token_code: i + loopCount*2,
                public_address: randStr(20),
              },
              {
                chain_code: i + loopCount*3,
                token_code: i + loopCount*3,
                public_address: randStr(20),
              },
              {
                chain_code: i + loopCount*4,
                token_code: i + loopCount*4,
                public_address: randStr(20),
              }
            ],
            max_fee: config.api.add_pub_address.fee,
            tpid: '',
            actor: user1.account
          }
        });
        //console.log('Result', result);
        console.log('Adding: ' + i + ", " + (i + loopCount) + ", " + (i + loopCount*2) + ", " + (i + loopCount*3) + ", " + (i + loopCount*4))
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
        break;
      }
    }
  })

  it(`Add last 4 addresses to userA1`, async () => {
    for (i = 0; i < totalAddresses - 5; i++) {
      try {
        const result = await callFioApiSigned('push_transaction', {
          action: 'addaddress',
          account: 'fio.address',
          actor: user1.account,
          privKey: user1.privateKey,
          data: {
            fio_address: user1.address,
            public_addresses: [
              {
                chain_code: totalAddresses - 5,
                token_code: totalAddresses - 5,
                public_address: randStr(20),
              },
              {
                chain_code: totalAddresses - 4,
                token_code: totalAddresses - 4,
                public_address: randStr(20),
              },
              {
                chain_code: totalAddresses - 3,
                token_code: totalAddresses - 3,
                public_address: randStr(20),
              },
              {
                chain_code: totalAddresses - 2,
                token_code: totalAddresses - 2,
                public_address: randStr(20),
              }
            ],
            max_fee: config.api.add_pub_address.fee,
            tpid: '',
            actor: user1.account
          }
        });
        //console.log('Result', result);
        console.log('Adding: ' + i + ", " + (i + loopCount) + ", " + (i + loopCount*2) + ", " + (i + loopCount*3) + ", " + (i + loopCount*4))
      } catch (err) {
        console.log('Error', err);
        expect(err).to.equal(null);
        break;
      }
    }
  })

  it('Get all public addresses for user1.', async () => {
    foundAddresses = 0;
    for (i = 0; i < totalAddresses; i++) {
      try {
        const json = {
          fio_address: 'iqzcg@evauplpede', //user1.address,
          chain_code: i,
          token_code: i
        }
        foundAddresses++;
        result = await callFioApi("get_pub_address", json);
        console.log('Result: ', i, result);
      } catch (err) {
        console.log('Missing', i)
        //expect(err).to.equal(null)
      }
    }
  })

  it('Confirm there are 200.', async () => {
    expect(foundAddresses).to.equal(200)
  })

  it(`Add ${totalAddresses}+1 address. Expect fail.`, async () => {
    try {
      const result = await callFioApiSigned('push_transaction', {
        action: 'addaddress',
        account: 'fio.address',
        actor: user1.account,
        privKey: user1.privateKey,
        data: {
          fio_address: user1.address,
          public_addresses: [
            {
              chain_code: totalAddresses + 1,
              token_code: totalAddresses + 1,
              public_address: randStr(20),
            }
          ],
          max_fee: config.api.add_pub_address.fee,
          tpid: '',
          actor: user1.account
        }
      });
      //console.log('Result', result);
    } catch (err) {
      console.log('Error', err)
      expect(err).to.equal(null)
    }
  })

  it('Get all public addresses for user1', async () => {
    for (i = 0; i < totalAddresses; i++) {
      try {
        const json = {
          fio_address: 'iqzcg@evauplpede', //user1.address,
          chain_code: i,
          token_code: i
        }
        result = await callFioApi("get_pub_address", json);
        console.log('Result: ', i, result);
      } catch (err) {
        console.log('Missing', i)
        //expect(err).to.equal(null)
      }
    }
  })
  

  it.skip('get_pub_addresses for user1', async () => {
    try {
        const result = await callFioApi("get_pub_addresses", {
        fio_address: user1.address,
        limit: 2000,
        offset: 0
      })
      console.log('Result', result)
      expect(result.public_addresses[0].token_code).to.equal("FIO")
      expect(result.public_addresses[0].chain_code).to.equal("FIO")
      expect(result.public_addresses.length).to.equal(1)

    } catch (err) {
      console.log('Error', err)
      expect(err).to.equal(null)
    }
  })

})
