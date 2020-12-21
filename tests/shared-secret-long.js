/*

https://en.wikipedia.org/wiki/Elliptic-curve_Diffie–Hellman
fiojs/src/ecc/key_private.js > getSharedSecret

public_key = private_key * G (the public key is the result of adding G to itself private_key times)
alice_private * bob_public = alice_private * bob_private * G = bob_private * alice_private * G = bob_private * alice_public

*/

const { Ecc } = require("@fioprotocol/fiojs");
//const { TextEncoder, TextDecoder } = require("text-encoding");
const text_encoding_1 = require('text-encoding');
const textEncoder = new text_encoding_1.TextEncoder();
const textDecoder = new text_encoding_1.TextDecoder();
var ser = require("@fioprotocol/fiojs/dist/chain-serialize");
var encryption_check_1 = require("@fioprotocol/fiojs/dist/encryption-check");

var fioAbi = require('@fioprotocol/fiojs/src/encryption-fio.abi.json');
var fioTypes = ser.getTypesFromAbi(ser.createInitialTypes(), fioAbi);
/** Convert `value` to binary form. `type` must be a built-in abi type. */
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

// const content = 'Secret message shared between Bob and Alice'

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

IV = "sixteencharacter"

//test = new Blob(['randombytes']).size
//console.log('size: ', test)

test2 = Buffer.byteLength("sixteencharacter", 'utf8')
console.log('size: ', test2)


fioContentType = 'record_obt_data_content'
var buffer = new ser.SerialBuffer({ textEncoder, textDecoder });
serialize(buffer, fioContentType, content);
var message = Buffer.from(buffer.asUint8Array());
var cipherbuffer = encryption_check_1.checkEncrypt(bobSharedSecret, message);
   // checkDecrypt(this.sharedSecret, cipherbuffer);
mycipher =  cipherbuffer.toString('base64');

console.log('mycipher: ', mycipher)


/* Decrypt */

var message = encryption_check_1.checkDecrypt(aliceSharedSecret, Buffer.from(mycipher, 'base64'));
var messageArray = Uint8Array.from(message);
var buffer = new ser.SerialBuffer({ array: messageArray, textEncoder, textDecoder });
decryptedCipher = deserialize(buffer, fioContentType);

console.log('decryptedCipher: ', decryptedCipher)

/*
var buffer = new ser.SerialBuffer({ textEncoder, textDecoder });

fioAbi = {
    "version": "eosio::abi/1.0",
    "types": [],
    "structs": [{
        "name": "new_funds_content",
        "base": "",
        "fields": [
            {"name": "payee_public_address", "type": "string"},
            {"name": "amount", "type": "string"},
            {"name": "chain_code", "type": "string"},
            {"name": "token_code", "type": "string"},
            {"name": "memo", "type": "string?"},
            {"name": "hash", "type": "string?"},
            {"name": "offline_url", "type": "string?"}
        ]
    }, {
        "name": "record_obt_data_content",
        "base": "",
        "fields": [
            {"name": "payer_public_address", "type": "string"},
            {"name": "payee_public_address", "type": "string"},
            {"name": "amount", "type": "string"},
            {"name": "chain_code", "type": "string"},
            {"name": "token_code", "type": "string"},
            {"name": "status", "type": "string"},
            {"name": "obt_id", "type": "string"},
            {"name": "memo", "type": "string?"},
            {"name": "hash", "type": "string?"},
            {"name": "offline_url", "type": "string?"}
        ]
    }]
}
// ser.createInitialTypes returns a Map object of differen types
var fioTypes = ser.getTypesFromAbi(ser.createInitialTypes(), fioAbi);

type = 'record_obt_data_content'

//fioTypes.get(type).serialize(buffer, content);

serialize(buffer, content);




var message = Buffer.from(buffer.asUint8Array());

// IV = randomBytes(16) - An unpredictable strong random value
var cipherbuffer = encryption_check_1.checkEncrypt(bobSharedSecret, message, IV);

encryptedMessage = cipherbuffer.toString('base64');

console.log ('encryptedMessage', encryptedMessage)
*/

/*
SharedCipher.prototype.encrypt = function (fioContentType, content, IV) {

    // 1. 
    var buffer = new ser.SerialBuffer({ textEncoder: this.textEncoder, textDecoder: this.textDecoder });



    // 2. 
    serialize(buffer, fioContentType, content);

    function serialize(serialBuffer, type, value) {
        fioTypes.get(type).serialize(serialBuffer, value);
    }


    // 3.
    var message = Buffer.from(buffer.asUint8Array());


    // 4. 
    var cipherbuffer = encryption_check_1.checkEncrypt(this.sharedSecret, message, IV);



    // checkDecrypt(this.sharedSecret, cipherbuffer);
    return cipherbuffer.toString('base64');
};

*/