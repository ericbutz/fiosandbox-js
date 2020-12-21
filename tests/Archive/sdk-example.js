const {FIOSDK } = require('@fioprotocol/FIOSDK')
fetch = require('node-fetch')

const fetchJson = async (uri, opts = {}) => {
  return fetch(uri, opts)
}

//const baseUrl = 'http://testnet.fioprotocol.io/v1/'
const baseUrl = 'http://localhost:8889/v1/'

// Create keypair on Testnet monitor and fund from faucet. 
/*
const user = {
  privateKey: '5KUDbyT8y9TrKqUmjtBgU3q3jSdr6iB9AwGL7Ckiux5gThrTY8F',
  publicKey: 'FIO7xSZcwyrhbSc6StgCbwpyQKfhewEUCjXkMRKyqDCKMvEqT3arN',
  account: 'ojqvu4snzuxa',
  domain: 'mytestdomain',  // The domain you want to register
  address: 'mytestaddress@mytestdomain'  // The address you want to register
}
*/
const user = {
  privateKey: '5JZLXywpLuVBDfD64iLCaJawydHs7S3tnsPthPyP3bpvUYZfNv9',
  publicKey: 'FIO7nNonLMPPrz42AtmM9oJFXqE7fpzA5AWjMCkeMYRycQq13qACf',
  account: 'xplbzamym1pt',
  domain: 'mytestdomain28',  // The domain you want to register
  address: 'mytestaddress22@mytestdomain28'  // The address you want to register
}

const userSdk = new FIOSDK(
  user.privateKey,
  user.publicKey,
  baseUrl,
  fetchJson
)

fioRegisterDomain = async () => {
  const reg = await userSdk.genericAction('isAvailable', {
    fioName: user.domain,
  })
  if (reg.is_registered) {
    return('Domain already registered.');
  }

  const result = await userSdk.genericAction('registerFioDomain', { 
    fioDomain: user.domain, 
    maxFee: 800000000000,
    technologyProviderId: 'rewards@wallet'
  })
  return result;
}

fioRegisterAddress = async () => {
  const reg = await userSdk.genericAction('isAvailable', {
    fioName: user.address,
  })
  if (reg.is_registered) {
    return('Address already registered.');
  }

  const result = await userSdk.genericAction('registerFioAddress', {
    fioAddress: user.address,
    maxFee: 40000000000,
    technologyProviderId: 'rewards@wallet'
  })
  return result;
}

fioAddAddress = async () => {
  const result = await userSdk.genericAction('addPublicAddresses', {
    fioAddress: user.address,
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
        chain_code: 'ELA',//
        token_code: 'ELA',
        public_address: 'EQH6o4xfaR5fbhV8cDbDGRxwJRJn3qeo41',
      }
    ],
    maxFee: 600000000,
    technologyProviderId: 'rewards@wallet'
  })
  return result;
}

fioRegisterDomain()
.then(response => {
  console.log('fioRegisterDomain: ', response);
  return fioRegisterAddress();
})
.then(response => {
  console.log('fioRegisterAddress: ', response);
  return fioAddAddress();
})
.then(response => {
  console.log('fioAddAddress: ', response);
})
.catch(e => {
  if (e.json) { console.log('Error: ', e.json); }
  else { console.log('Error: ', e) }
});




