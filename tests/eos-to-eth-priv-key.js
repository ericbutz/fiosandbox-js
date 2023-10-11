// Extracted from https://github.com/eoscafe/eoskeyio

const ecc = require('eosjs-ecc');
const eth = require('ethereumjs-util');
const base58 = require('bs58');

const hdkey = require('hdkey')
const wif = require('wif')
const bip39 = require('bip39');
const ethers = require('ethers');

let ethereumPrivateKey = '';

if (eth.isValidPrivate(Buffer.from(ethereumPrivateKey, 'hex'))) {
  //let ethereumAddress = '0x' + eth.privateToAddress(Buffer.from(ethereumPrivateKey, 'hex')).toString('hex')
  //console.log(`ethereumAddress: ${ethereumAddress}`);
  //let ethereumPublicKey = eth.privateToPublic(Buffer.from(ethereumPrivateKey, 'hex')).toString('hex');
  //console.log(`ethereumPublicKey: ${ethereumPublicKey}`);

  // Create EOS keys
  const eosnew = Buffer.from(ethereumPrivateKey, 'hex');
  console.log('eosnew: ', eosnew);
  const myprivkey = wif.encode(128, eosnew, false);
  console.log('myprivkey: ', myprivkey);


  const eos = ecc.PrivateKey(eosnew);
  
  
  //let eos = ecc.PrivateKey(Buffer.from(ethereumPrivateKey, 'hex'))
  //console.log('eos: ', eos);

  const eosWIF = eos.toWif();
  let convertedEOSPrivateKey = eosWIF
  let convertedEOSPublicKey = ecc.privateToPublic(eosWIF)

  console.log(`EOS Private Key: ${convertedEOSPrivateKey}`)
  console.log(`EOS Public Key: ${convertedEOSPublicKey}`)
} else {
  console.log("Invalid Ethereum Private Key")
}


//privateKey = base58.decode(convertedEOSPrivateKey);

//console.log(`Back to ETH Private Key: ${privateKey}`);



const mnemonic = 'artwork robust path corn table enact giraffe panel this can grocery film'

const ethSdk = async () => {
  let walletMnemonic = ethers.Wallet.fromMnemonic(mnemonic);
  const privkey = walletMnemonic.privateKey;
  pubkey = walletMnemonic.address;

  console.log('\nETHSDK.\nprivateKey: ', privkey);
  console.log('publicKey: ', pubkey);
}
ethSdk();

const eosRaw = async () => {
  const seedBytes = await bip39.mnemonicToSeed(mnemonic);
  const seed = await seedBytes.toString('hex');   // This is the BIP39 Seed. Same for all derivations.
  console.log('Seed: ', seed);
  const master = hdkey.fromMasterSeed(Buffer(seed, 'hex'));
  const node = master.derive('m/44\'/194\'/0\'/0/0');
  console.log('node: ', node._privateKey);
  const privkey = wif.encode(128, node._privateKey, false);
  const pubkey = ecc.PublicKey(node._publicKey).toString()

  console.log('\nEOSRAW.\nprivateKey: ', privkey);
  console.log('publicKey: ', pubkey);
}
eosRaw();

const fioRaw = async () => {
    const seedBytes = await bip39.mnemonicToSeed(mnemonic);
    const seed = await seedBytes.toString('hex');
    const master = hdkey.fromMasterSeed(Buffer(seed, 'hex'));
    const node = master.derive('m/44\'/235\'/0\'/0/0');
    const privkey = wif.encode(128, node._privateKey, false);
    const publicKey = ecc.privateToPublic(privkey);

    console.log('\nFIORAW.\nprivateKey: ', privkey);
    console.log('publicKey: ', publicKey);
}
fioRaw();

const fioSdk = async () => {
  const {FIOSDK } = require('@fioprotocol/FIOSDK')

  const privateKeyRes = await FIOSDK.createPrivateKeyMnemonic(mnemonic)
  const privKey = privateKeyRes.fioKey
  const publicKeyRes = FIOSDK.derivedPublicKey(privKey)
  const pubKey = publicKeyRes.publicKey

  console.log('\nFIOSDK.\nprivateKey: ', privKey);
  console.log('publicKey: ', pubKey);
}

fioSdk();