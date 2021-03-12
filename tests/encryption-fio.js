const { TextEncoder, TextDecoder } = require('text-encoding');

import * as crypto from 'browserify-aes'

const createHmac = require('create-hmac')
const createHash = require('create-hash')

import * as ser from '../chain-serialize';

const { PublicKey, PrivateKey } = require('./ecc');
const { serialize, deserialize, createSharedCipher } = require('../encryption-fio');

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

/**
    Encrypt the content of a FIO message.

    @arg {string} fioContentType - `new_funds_content`, etc
    @arg {object} content
    @arg {Buffer} [IV = randomBytes(16)] - An unpredictable strong random value
        is required and supplied by default.  Unit tests may provide a static value
        to achieve predictable results.
    @return {string} cipher base64
*/
function encrypt(fioContentType: string, content: any, IV? : Buffer) : string {
    const buffer = new ser.SerialBuffer({ textEncoder: this.textEncoder, textDecoder: this.textDecoder });
    serialize(buffer, fioContentType, content);
    const message = Buffer.from(buffer.asUint8Array());
    const cipherbuffer = checkEncrypt(this.sharedSecret, message, IV);
    return cipherbuffer.toString('base64')
}


// Look in key_private.js in fiojs
/**
    Private keys can be any 256 bit (32 byte) value from 0x1 to 
    0xFFFF FFFF FFFF FFFF FFFF FFFF FFFF FFFF BAAE DCE6 AF48 A03B BFD2 5E8C D036 4140 

    A common (but not the most secure) way of creating a private key is to start with a seed, 
    such as a group of words or passphrases picked at random. This seed is then passed through 
    the SHA256 algorithm, which will always conveniently generate a 256 bit value.
*/

const seed = 'valley alien library bread worry brother bundle hammer loyal barely dune brave'
hash.sha256(seed)

PrivateKey.fromSeed = function(seed) { // generate_private_key
    if (!(typeof seed === 'string')) {
        throw new Error('seed must be of type string');
    }
    return PrivateKey.fromBuffer(hash.sha256(seed));
}

PrivateKey.fromBuffer = function(buf) {
    if (!Buffer.isBuffer(buf)) {
        throw new Error("Expecting parameter to be a Buffer type");
    }
    if(buf.length === 33 && buf[32] === 1) {
      // remove compression flag
      buf = buf.slice(0, -1)
    }
    if (32 !== buf.length) {
      throw new Error(`Expecting 32 bytes, instead got ${buf.length}`);
    }
    return PrivateKey(BigInteger.fromBuffer(buf));
}




/* We will encrypt a new funds request */
const newFundsContent: null|any = {
    payee_public_address: 'purse.alice',
    amount: '1',
    chain_code: 'FIO',
    token_code: 'FIO',
    memo: null,
    hash: null,
    offline_url: null
}

/* Create Shared Secret */
privateKey = PrivateKey(privateKey);
publicKey = PublicKey(publicKey);



const sharedSecret = privateKey.getSharedSecret(publicKey);

function getSharedSecret(public_key) {
    public_key = PublicKey(public_key)
    let KB = public_key.toUncompressed().toBuffer()
    let KBP = Point.fromAffine(
      secp256k1,
      BigInteger.fromBuffer( KB.slice( 1,33 )), // x
      BigInteger.fromBuffer( KB.slice( 33,65 )) // y
    )
    let r = toBuffer()
    let P = KBP.multiply(BigInteger.fromBuffer(r))
    let S = P.affineX.toBuffer({size: 32})
    // SHA512 used in ECIES
    return hash.sha512(S)
}



/* Strong random value. IV must be 16 bytes */
const IV = Buffer.from('f300888ca4f512cebdc0020ff0f7224c', 'hex');

const buffer = new ser.SerialBuffer({ textEncoder, textDecoder });
serialize(buffer, 'new_funds_content', newFundsContent);
const message = Buffer.from(buffer.asUint8Array());


// const cipherbuffer = checkEncrypt(sharedSecret, message, IV);

//export function checkEncrypt(secret: Buffer, message: Buffer, IV?: Buffer) : Buffer {
/**
 * SHA-512 is a secure hashing algorithm that has an output size of 512 bits (64 bytes).
 * Here we take the shared secret and hash it to 64 bytes. We split the hash into halves.
 * The first 32 bytes are used for encryption (Ke). The second 32 bytes are used for MAC.
 * a message authentication code (MAC), sometimes known as a tag, is a short piece of information 
 * used to authenticate a message—in other words, to confirm that the message came from the stated 
 * sender (its authenticity) and has not been changed.
 */
const K = createHash('sha512').update(sharedSecret).digest();
const Ke = K.slice(0, 32); // Encryption
const Km = K.slice(32); // MAC

// Cipher performs PKCS#5 padded automatically
const cipher = crypto.createCipheriv('aes-256-cbc', Ke, IV);


const C = Buffer.concat([cipher.update(message), cipher.final()]);
// Include in the HMAC input everything that impacts the decryption
const M = createHmac('sha256', Km).update(Buffer.concat([IV, C])).digest(); // AuthTag

return Buffer.concat([IV, C, M]);



const mycipher = cipherbuffer.toString('base64');
console.log('mycipher: ', mycipher);











describe('Encryption FIO', () => {
    const newFundsContent: null|any = {
        payee_public_address: 'purse.alice',
        amount: '1',
        chain_code: 'FIO',
        token_code: 'FIO',
        memo: null,
        hash: null,
        offline_url: null
    }

    const newFundsContentHex = '0B70757273652E616C69636501310346494F0346494F000000';

    it('serialize', function() {
        const buffer = new ser.SerialBuffer({ textEncoder, textDecoder });
        serialize(buffer, 'new_funds_content', newFundsContent);
        expect(ser.arrayToHex(buffer.asUint8Array())).toEqual(newFundsContentHex);
    })

    it('deserialize', function() {
        const array = ser.hexToUint8Array(newFundsContentHex);
        const buffer = new ser.SerialBuffer({ array, textEncoder, textDecoder });
        const newFundsContentRes = deserialize(buffer, 'new_funds_content');
        expect(newFundsContentRes).toEqual(newFundsContent);
    })

    describe('Diffie Cipher', function () {
        const privateKeyAlice = PrivateKey.fromSeed('alice');
        const publicKeyAlice = privateKeyAlice.toPublic();
        const privateKeyBob = PrivateKey.fromSeed('bob');
        const publicKeyBob = privateKeyBob.toPublic();

        const IV = Buffer.from('f300888ca4f512cebdc0020ff0f7224c', 'hex');
        const newFundsContentCipherBase64 = '8wCIjKT1Es69wAIP8PciTOB8F09qqDGdsq0XriIWcOkqpZe9q4FwKu3SGILtnAWtJGETbcAqd3zX7NDptPUQsS1ZfEPiK6Hv0nJyNbxwiQc=';

        it('encrypt', function() {
            //const cipherAlice = createSharedCipher({privateKey: privateKeyAlice, publicKey: publicKeyBob, textEncoder, textDecoder});
            //const cipherAliceBase64 = cipherAlice.encrypt('new_funds_content', newFundsContent, IV);
            const cipherAliceBase64 = cipherAlice.encrypt('new_funds_content', newFundsContent, IV);
            //expect(cipherAliceBase64).toEqual(newFundsContentCipherBase64);

            const cipherBob = createSharedCipher({privateKey: privateKeyBob, publicKey: publicKeyAlice, textEncoder, textDecoder});
            const cipherBobBase64 = cipherBob.encrypt('new_funds_content', newFundsContent, IV);
            expect(cipherBobBase64).toEqual(newFundsContentCipherBase64);
        })

        it('decrypt', function() {
            const cipherAlice = createSharedCipher({privateKey: privateKeyAlice, publicKey: publicKeyBob, textEncoder, textDecoder});
            const newFundsContentAlice = cipherAlice.decrypt('new_funds_content', newFundsContentCipherBase64);
            expect(newFundsContentAlice).toEqual(newFundsContent);

            const cipherBob = createSharedCipher({privateKey: privateKeyBob, publicKey: publicKeyAlice, textEncoder, textDecoder});
            const newFundsContentBob = cipherBob.decrypt('new_funds_content', newFundsContentCipherBase64);
            expect(newFundsContentBob).toEqual(newFundsContent);
        })

        it('hashA', function() {
            const privateKey = PrivateKey.fromSeed('')
            const publicKey = privateKey.toPublic()
            const cipher = createSharedCipher({privateKey, publicKey})
            expect(cipher.hashA('')).toEqual('0x7a5de2d59c72b94c67a192a9009484ef')
            expect(cipher.hashA(Buffer.from(''))).toEqual('0x7a5de2d59c72b94c67a192a9009484ef')
            expect(cipher.hashA(publicKey.toBuffer())).toEqual('0x2521bccef77d48793a7a80716e79a46d')
        })
    })

})
