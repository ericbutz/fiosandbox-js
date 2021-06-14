/**
    FIO private keys (like EOS private keys) are WIF encoded.
    This code demonstrates how to validate a FIO private key
    To get the raw private key from an FIO private key:


    1. Start with a FIO Public Key Key.

    `FIO5kJKNHwctcfUM5XZyiWSqSTM5HTzznJP9F3ZdbhaQAHEVq575o`

    2. Strip off the initial "FIO" string.

    `5kJKNHwctcfUM5XZyiWSqSTM5HTzznJP9F3ZdbhaQAHEVq575o`

    3. Base58 decode the public key.

    `xxxx`

    `0565fba7`

    4. Trim off the last 4 checksum bytes and you are left with a 33 byte compressed public key.

    `xxxx`

    `0565fba7`

    5. Perform a RIPEMD-160 hash on the key.

    `ce145d282834c009c24410812a60588c1085b63d65a7effc2e0a5e3a2e21b236`

    6. Take the first 4 bytes of the hash, this is the checksum.

    `0565fba7`

    7. Make sure the checksum in steps 3 and 6 match.
*/

const assert = require('assert')
const base58 = require('bs58')
const createHash = require('create-hash')

// 1. Start with a FIO Public Key Key.
let publicKey = 'FIO5kJKNHwctcfUM5XZyiWSqSTM5HTzznJP9F3ZdbhaQAHEVq575o';

// 2. Strip off the initial "FIO" string.
publicKey = publicKey.slice(3)
console.log('\nWith first byte trimmed: ', publicKey)

// 3. Base58 decode the public key.
publicKey = base58.decode(publicKey);
console.log('Base58 decoded public key: ', publicKey.toString('hex'))
//console.log('Base58 decoded public key (hex): ', publicKey.toString('hex'))

// 4. Trim off the last 4 checksum bytes and you are left with a 33 byte compressed public key.
checksum1 = publicKey.slice(-4)
console.log('checksum1: ', checksum1.toString('hex'))
publicKey = publicKey.slice(0,-4)
console.log('Raw public key (With final 4 bytes trimmed): ', publicKey.toString('hex'))

// 5. Perform a RIPEMD-160 hash on the key.
publicKey = createHash('rmd160').update(publicKey).digest()
console.log('Raw public key ripemd-160 encoded: ', publicKey.toString('hex'))

// 6. Take the first 4 bytes of the hash, this is the checksum.
checksum2 = publicKey.slice(0,4)
console.log('checksum2: ', checksum2.toString('hex'))

// 7. Make sure the checksum in steps 3 and 6 match.
assert(checksum2 = checksum1, 'Checksum failed!')