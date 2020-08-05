require('mocha')
const {expect} = require('chai')
const {newUser} = require('../utils.js');
const {FIOSDK } = require('@fioprotocol/FIOSDK')
config = require('../config.js');
const rp = require('request-promise');

before(async () => {

})

function callFioApi(apiCall, JSONObject, fiourl) {
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

describe(`Getpubaddress mainnet test`, () => {

  it('getpubaddress from https://fio.eu.eosamsterdam.net/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://fio.eu.eosamsterdam.net/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from https://fio.eosdac.io/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://fio.eosdac.io/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from http://fioapi.nodeone.io:6881/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "http://fioapi.nodeone.io:6881/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from https://fio.eosphere.io/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://fio.eosphere.io/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from https://fio.eosrio.io/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://fio.eosrio.io/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from https://fio.acherontrading.com/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://fio.acherontrading.com/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from https://fio.eos.barcelona/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://fio.eos.barcelona/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from https://api.fio.eosdetroit.io/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://api.fio.eosdetroit.io/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from https://fio.zenblocks.io/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://fio.zenblocks.io/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from https://api.fio.alohaeos.com/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://api.fio.alohaeos.com/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from https://fio.greymass.com/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://fio.greymass.com/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from https://fio.eosusa.news/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://fio.eosusa.news/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from https://fio.eosargentina.io/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://fio.eosargentina.io/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from https://fio.cryptolions.io/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://fio.cryptolions.io/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from https://fio-mainnet.eosblocksmith.io/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://fio-mainnet.eosblocksmith.io/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from https://api.fio.currencyhub.io/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://api.fio.currencyhub.io/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from https://fio.eoscannon.io/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://fio.eoscannon.io/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from https://fio.eosdublin.io/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://fio.eosdublin.io/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from https://fio.eossweden.org/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://fio.eossweden.org/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })

  it('getpubaddress from https://fio.maltablock.org/v1/chain/', async () => {
    try {
      const json = {
        fio_address: 'ericbutz@guarda',
        chain_code: "FIO",
        token_code: "FIO"
      }
      fiourl = "https://fio.maltablock.org/v1/chain/";
      result = await callFioApi("get_pub_address", json, fiourl);
      //console.log('result: ', result);
    } catch (err) {
      console.log('Error', err);
      expect(err).to.equal(null);
    }
  })


})
