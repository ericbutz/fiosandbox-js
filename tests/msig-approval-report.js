require('mocha')
const {expect} = require('chai')
const {callFioApi, fetchJson} = require('../utils.js');
config = require('../config.js');

const bps = [
  {accountMainnet: "jnmwi5vu3hle", addressMainnet: "eosio@detroit", accountTestnet: "yz5p4rb4begx", addressTestnet: "eosiodetroit@fiotestnet", contact = "@robrigo"},
  {accountMainnet: "jnmwi5vu3hle", addressMainnet: "eosio@detroit", accountTestnet: "yz5p4rb4begx", addressTestnet: "eosiodetroit@fiotestnet", contact = "@robrigo"}
]

describe('Create BP msig approval message', () => {

  let prodList = []

  it('Get top 21 producers and put them into prodList string', async () => {
    try {
      const json = {
        json: true,               // Get the response as json
        code: 'eosio',      // Contract that we target
        scope: 'eosio',         // Account that owns the data
        table: 'producers',        // Table name
        limit: 1000,                // Maximum number of rows that we want to get
        reverse: false,           // Optional: Get reversed data
        show_payer: false          // Optional: Show ram payer
      }
      result = await callFioApi("get_table_rows", json);
      prodsTable = result.rows;
      prodList = "";
      prodCount = 0
      for (prod in prodsTable) { 
        if (Mainnet) {
          bp = bps.find(bps => bps.accountMainnet === prodsTable[prod].owner);
        } else {
          bp = bps.find(bps => bps.accountTestnet === prodsTable[prod].owner);
        }
        contactInfo = bp.contact
         
        prodEntry = {
          owner: prodsTable[prod].owner,
          address: prodsTable[prod].address,
          contact: contactInfo
        }
        prodList.push(prodEntry);

        prodCount++;
        if (prodCount==21) { break; }
      }
      //console.log('prodList: ', prodList)
    } catch (err) {
      console.log('Error: ', err);
      expect(err).to.equal(null);
    }
  })
  it('Output message', async () => {
  console.log('\nReview: ./clio.sh multisig review ' + proposer +  " " + proposalName);
  console.log('\nTo approve:\n ./clio.sh multisig approve ' + proposer +  " " + proposalName + " '" + '{"actor": "APPROVER_ACC_NAME", "permission": "active"}' + "' " + "400000000 -p APPROVER_ACC_NAME");
  console.log('\nGet list approvals:\n ./clio.sh get table eosio.msig  ' + proposer +  " " + " approvals2 -L " + proposalName + " -l 1");
  })

})
