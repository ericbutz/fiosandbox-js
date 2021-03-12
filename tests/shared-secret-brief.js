/*

https://en.wikipedia.org/wiki/Elliptic-curve_Diffie–Hellman
fiojs/src/ecc/key_private.js > getSharedSecret

public_key = private_key * G (the public key is the result of adding G to itself private_key times)
alice_private * bob_public = alice_private * bob_private * G = bob_private * alice_private * G = bob_private * alice_public

*/

const { Ecc } = require("@fioprotocol/fiojs");
const text_encoding_1 = require('text-encoding');
const textEncoder = new text_encoding_1.TextEncoder();
const textDecoder = new text_encoding_1.TextDecoder();
var ser = require("@fioprotocol/fiojs/dist/chain-serialize");
var encryption_check_1 = require("@fioprotocol/fiojs/dist/encryption-check");

var fioAbi = require('@fioprotocol/fiojs/src/encryption-fio.abi.json');
var fioTypes = ser.getTypesFromAbi(ser.createInitialTypes(), fioAbi);


function serialize(serialBuffer, type, value) {
    fioTypes.get(type).serialize(serialBuffer, value);
}

function deserialize(serialBuffer, type) {
    return fioTypes.get(type).deserialize(serialBuffer);
}

const bob_private='5JoQtsKQuH8hC9MyvfJAqo6qmKLm8ePYNucs7tPu2YxG12trzBt'
const bob_public='FIO5VE6Dgy9FUmd1mFotXwF88HkQN1KysCWLPqpVnDMjRvGRi1YrM'

const alice_private='5J9bWm2ThenDm3tjvmUgHtWCVMUdjRR1pxnRtnJjvKA4b2ut5WK'
const alice_public='FIO7zsqi7QUAjTAdyynd6DVe8uv4K8gCTRHnAoMN9w9CA1xLCTDVv'

/* After exchanging public keys, both Bob and Alice can create a shared secret */

bobSharedSecret = Ecc.PrivateKey(bob_private).getSharedSecret(alice_public)
aliceSharedSecret = Ecc.PrivateKey(alice_private).getSharedSecret(bob_public)

//console.log('bob: ', bobSharedSecret) 
//  = <Buffer a7 1b 4e c5 a9 57 79 26 a1 d2 aa 1d 9d 99 32 7f d3 b6 8f 6a 1e a5 97 20 0a 0d 89 0b d3 33 1d f3 00 a2 d4 9f ec 0b 2b 3e 69 69 ce 92 63 c5 d6 cf 47 c1 ... 14 more bytes>

//console.log('alice: ', aliceSharedSecret) 
// = <Buffer a7 1b 4e c5 a9 57 79 26 a1 d2 aa 1d 9d 99 32 7f d3 b6 8f 6a 1e a5 97 20 0a 0d 89 0b d3 33 1d f3 00 a2 d4 9f ec 0b 2b 3e 69 69 ce 92 63 c5 d6 cf 47 c1 ... 14 more bytes>

/* Now user the shared secret to encrypt some content */

fioContentType = 'record_obt_data_content'

const content = {
    payer_public_address: 'test@test',
    payee_public_address: 'test2@test',
    amount: 3000000,
    chain_code: 'FIO',
    token_code: 'FIO',
    status: 2,
    obt_id: '',
    memo: 'this is a memo',
    hash: '',
    offline_url: ''
};

/* Encrypt with bobSharedSecret */

var buffer = new ser.SerialBuffer({ textEncoder, textDecoder });
serialize(buffer, fioContentType, content);
var message = Buffer.from(buffer.asUint8Array());
var cipherbuffer = encryption_check_1.checkEncrypt(bobSharedSecret, message);

encryptedContent =  cipherbuffer.toString('base64');

console.log('encryptedContent: ', encryptedContent)


/* Decrypt with aliceSharedSecret */

var message = encryption_check_1.checkDecrypt(aliceSharedSecret, Buffer.from(encryptedContent, 'base64'));
var messageArray = Uint8Array.from(message);
var buffer = new ser.SerialBuffer({ array: messageArray, textEncoder, textDecoder });
decryptedContent = deserialize(buffer, fioContentType);

console.log('decryptedContent: ', decryptedContent)



