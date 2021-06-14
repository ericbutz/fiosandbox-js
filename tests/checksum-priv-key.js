/**
    FIO private keys (like EOS private keys) are WIF encoded.
    This code demonstrates how to validate a FIO private key
    To get the raw private key from an FIO private key:

    1. Start with the Wallet Import Private Key.

    `5HpHagT65TZzG1PH3CSu63k8DbpvD8s5ip4nEB3kEsreAbuatmU`

    2. Base58 decode the WIF string (shown as HEX here).

    `8000000000000000000000000000000000000000000000000000000000000000000565fba7`

    3. Slice the decoded WIF into the versioned key and the checksum (last 4 bytes).

    `800000000000000000000000000000000000000000000000000000000000000000`

    `0565fba7`

    4. Perform a binary SHA-256 hash on the versioned key.

    `ce145d282834c009c24410812a60588c1085b63d65a7effc2e0a5e3a2e21b236`

    5. Perform another binary SHA-256 hash on result of SHA-256 hash.

    `0565fba7ebf8143516e0222d7950c28589a34c3ee144c3876ceb01bfb0e9bb70`

    6. Take the first 4 bytes of the second SHA-256 hash, this is the checksum.

    `0565fba7`

    7. Make sure the checksum in steps 3 and 6 match.

    8. Slice the versioned private key from step 3 into the version and private key.

    `80`

    `0000000000000000000000000000000000000000000000000000000000000000`

    9. If the version is 0x80 then there is no error.
*/

const assert = require('assert')
const base58 = require('bs58')
const createHash = require('create-hash')

// 1. Start with the Wallet Import Private Key.
let privateKey = '5Kbb37EAqQgZ9vWUHoPiC2uXYhyGSFNbL6oiDp24Ea1ADxV1qnu';

// 2. Base58 decode the WIF string (shown as HEX here). Returns a buffer.
privateKey = base58.decode(privateKey);
console.log('\nBase58 decoded private key: ', privateKey.toString('hex'))
//console.log('Base58 decoded private key (hex): ', privateKey.toString('hex'))


// Trim the first prefix byte (should be 80)
//privateKey = privateKey.slice(1)
//console.log('With first byte trimmed: ', privateKey)

// 3. Slice the decoded WIF into the versioned key and the checksum (last 4 bytes).
checksum1 = privateKey.slice(-4)
console.log('checksum1: ', checksum1.toString('hex'))
privateKey = privateKey.slice(0,-4)
console.log('Raw private key (With final 4 bytes trimmed): ', privateKey.toString('hex'))

// Add the prefix
//prefix80 = Buffer.from('80', 'hex');
//privateKey = Buffer.concat([prefix80, privateKey]);
//console.log('\nPrivate key with 80 prefix: ', privateKey);

// 4. Perform a binary SHA-256 hash on the versioned key.
privateKey = createHash('sha256').update(privateKey).digest()
console.log('Raw private key sha256 encoded x 1: ', privateKey.toString('hex'))

// 5. Perform another binary SHA-256 hash on result of SHA-256 hash.
privateKey = createHash('sha256').update(privateKey).digest()
console.log('Raw private key sha256 encoded x 2: ', privateKey.toString('hex'))

// 6. Take the first 4 bytes of the second SHA-256 hash, this is the checksum.
checksum2 = privateKey.slice(0,4)
console.log('checksum2: ', checksum2.toString('hex'))

// 7. Make sure the checksum in steps 3 and 6 match.
assert(checksum2 = checksum1, 'Checksum failed!')