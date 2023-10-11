const {FIOSDK } = require('@fioprotocol/fiosdk')
fetch = require('node-fetch')
const { Ecc } = require("@fioprotocol/fiojs");

const fetchJson = async (uri, opts = {}) => {
  return fetch(uri, opts)
}

const baseUrl = 'https://fiotestnet.greymass.com/v1/'

const privateKey = '',
  publicKey = '',
  payeeKey = '',  // FIO Public Key of the payee
  amount = 1000000000,
  max_fee = 100000000000


const main = async () => {

    user = new FIOSDK(
        '',
        '',
        baseUrl,
        fetchJson
    )

    const chainData = await user.transactions.getChainDataForTx();
    console.log('ChainData: ', chainData);
    const transaction = await user.transactions.createRawTransaction({
        action: 'trnsfiopubky',
        account: 'fio.token',
        data: {
            payee_public_key: payeeKey,
            amount: amount,
            max_fee: max_fee,
            tpid: ''
        },
        publicKey,
        chainData,
    });

    const { serializedContextFreeData, serializedTransaction } = await user.transactions.serialize({
        chainId: chainData.chain_id,
        transaction,
    });
    console.log('serializedContextFreeData: ', serializedContextFreeData);
    console.log('serializedTransaction: ', serializedTransaction);

    const signedTransaction = await user.transactions.sign({
        chainId: chainData.chain_id,
        privateKeys: [privateKey],
        transaction,
        serializedTransaction,
        serializedContextFreeData,
    });
    console.log('signedTransaction: ', signedTransaction);

    data = Ecc.hash.sha256('data')


    //const result = await user.executePreparedTrx('transfer_tokens_pub_key', signedTransaction);
    console.log(result);
}

main();