/**
 *  Private Keys
 * 
 *    See also: key_private.js in fiojs
 */

/**
    Private keys can be any 256 bit (32 byte) value from 0x1 to 
    0xFFFF FFFF FFFF FFFF FFFF FFFF FFFF FFFF BAAE DCE6 AF48 A03B BFD2 5E8C D036 4140 

    A common (but not the most secure) way of creating a private key is to start with a seed, 
    such as a group of words or passphrases picked at random. This seed is then passed through 
    the SHA256 algorithm, which will always conveniently generate a 256 bit value.

    We will use the following seed: 'valley alien library bread worry brother bundle hammer loyal barely dune brave'

    In the code below createHash returns a 'hex' (or base 16) encoded buffer. Every 2 digits represents 8 bits or 1 byte.
        createHash algorithms = ['sha1', 'sha224', 'sha256', 'sha384', 'sha512', 'md5', 'rmd160', 'ripemd160']
        createHash result (output) encoding = ['hex', 'base64', 'binary'] 
        createHash(algorithm).update(input).digest(encoding)

    This results in a 32 byte Private Key:
        privKeyBuf (buffer):  <Buffer ec 4a 33 07 bf c8 df a9 0d 23 c9 2b c8 a6 8f 5d bf 36 29 ca 92 f4 35 30 74 87 11 97 9b 99 2a 38> 
        privKeyStr (string format): ec4a3307bfc8dfa90d23c92bc8a68f5dbf3629ca92f43530748711979b992a38 (conversion to WIF format is described below)
*/
const createHash = require('create-hash')

const seed = 'valley alien library bread worry brother bundle hammer loyal barely dune brave'
privKeyBuf = createHash('sha256').update(seed).digest();
console.log('privKeyBuf length: ', privKeyBuf.length)
console.log('privKey Buffer: ', privKeyBuf);
privKeyStr = privKeyBuf.toString('hex')
console.log('privKey String: ', privKeyStr);
console.log('privKey String length: ', privKeyStr.length);


/** 
    FIO/EOSIO private keys are Wallet Import Format (WIF) encoded

    Wallet Import Format is an encoding for a private EDSA key. EOS uses the same version, checksum, and encoding 
    scheme as the Bitcoin WIF addresses and should be compatible with existing libraries.

    1. The private key derived from the seed phrase above is used. This is 32 bytes long (shown here as hex).
    ec4a3307bfc8dfa90d23c92bc8a68f5dbf3629ca92f43530748711979b992a38

    2. Add a 0x80 byte in front. This byte represents the Bitcoin mainnet. EOS uses the same version byte. 
    When encoded the version byte helps to identify this as a private key. 
    Unlike Bitcoin, EOS always uses compressed public keys (derived from a private key) and therefore does 
    not suffix the private key with a 0x01 byte.
    80ec4a3307bfc8dfa90d23c92bc8a68f5dbf3629ca92f43530748711979b992a38

    3. Perform a binary SHA-256 hash on the versioned key.
    a1e02119af84484fa7fde99d70065ec0ca0769a6ebfbe84f2baf9874fa7db1de

    4. Perform a binary SHA-256 hash on result of SHA-256 hash.
    7446faab7581ed6b71a7ea27dcf26ec5f64e726b091d0bfab993a10ec517602d

    5. Take the first 4 bytes of the second SHA-256 hash, this is the checksum.
    7446faab

    6. Add the 4 checksum bytes to the extended key from step 2.
    80ec4a3307bfc8dfa90d23c92bc8a68f5dbf3629ca92f43530748711979b992a387446faab

    7. Base58 encode the binary data from step 6.
    5KcMHgKYyxqEKf8zdHMJY1wRkC6VnVWfBdLJpTawNyR5ngAHVcW

*/

const base58 = require('bs58')

//privKeyStr = '0000000000000000000000000000000000000000000000000000000000000000'
prefix80 = '80'
console.log('privKeyStr: ', privKeyStr);
privKeyWif1 = prefix80.concat(privKeyStr);
privKeyWif1 = Buffer.from(privKeyWif1, 'hex')

privKeyWif2 = createHash('sha256').update(privKeyWif1).digest() //.toString('hex');
console.log('privKeyWif2: ', privKeyWif2.toString('hex'));

privKeyWif3 = createHash('sha256').update(privKeyWif2).digest() //.toString('hex');
console.log('privKeyWif3: ', privKeyWif3.toString('hex'));

checksum = privKeyWif3.slice(0, 4)
console.log('checksum: ', checksum.toString('hex'));

privKeyWif4 = Buffer.concat([privKeyWif1, checksum])
console.log('privKeyWif4: ', privKeyWif4.toString('hex'));
//privKeyWif4 = Buffer.from(privKeyWif4)

privKeyWif5 = base58.encode(privKeyWif4)
console.log('privKeyWif5: ', privKeyWif5);


/**
 *  Public Keys
 */

/**
    
    Deriving uncompressed public keys from a private key
    
    See: http://cryptocoinjs.com/modules/crypto/ecurve/

    The ecurve module works closely with the [bigi](http://cryptocoinjs.com/modules/misc/bigi/)(BigInteger) module

    Eliptic curve public keys are points on the curve.

    Public keys are generated from the private keys in Bitcoin using elliptic curve (secp256k1, Standards for 
    Efficient Cryptography) multiplication using the formula:
        K = k * G
            K is the public key
            k is a 256 bit private key
            G is a constant called the Generator Point which for secp256k1 is equal to:
                04 79BE667E F9DCBBAC 55A06295 CE870B07 029BFCDB 2DCE28D9 59F2815B 16F81798 
                483ADA77 26A3C465 5DA4FBFC 0E1108A8 FD17B448 A6855419 9C47D08F FB10D4B8

    For example, the seed above: 
    
        'valley alien library bread worry brother bundle hammer loyal barely dune brave'

    Results in the following uncompressed Public Key:

        04 4b4cc587 e8a11262 84673670 b3f8002b 8bed7ff6 0bb9cefc 35698aba faf12039  // This is the x-coord (32 bytes)
           94ce6c55 05aeae1c 58fa022b e9c95cf3 af13ab35 12aae806 12a563e9 6ad58d5e  // This is the y-coord (32 bytes)

    This public key contains a prefix 0x04 and the x and y coordinates on the elliptic curve secp256k1, respectively.
*/
const BigInteger = require('bigi');
privKeyBigInt = BigInteger.fromBuffer(privKeyBuf);  // privKeyBuf was derived from: createHash('sha256').update(seed).digest();
console.log('privKeyBigInt: ', privKeyBigInt);

const ecurve = require('ecurve');
const Point = ecurve.Point;
const secp256k1 = ecurve.getCurveByName('secp256k1');

const G = secp256k1.G

const curvePt = secp256k1.G.multiply(privKeyBigInt);  // Curve point
var x = curvePt.affineX.toBuffer(32)
var y = curvePt.affineY.toBuffer(32)
//console.log('curvePt: ', curvePt)
console.log('x: ', x.toString('hex'))
console.log('y: ', y.toString('hex'))

// This returns the uncompressed public key
const prefix04 = Buffer.from('04', 'hex');
publicKey = Buffer.concat([prefix04, x, y])
console.log('publicKey: ', publicKey.toString('hex'))

// This also returns the uncompressed public key
publicKey = curvePt.getEncoded(false) //false forces uncompressed public key
console.log('publicKey: ', publicKey.toString('hex'))


/** 
    Deriving compressed public keys
    
    Most wallets and nodes implement compressed public key as a default format because it is half as big as an uncompressed key, 
    saving blockchain space. To convert from an uncompressed public key to a compressed public key, you can omit the y value because 
    the y value can be solved for using the equation of the elliptic curve: y² = x³ + 7. Since the equation solves for y², 
    the right side of the equation could be either positive or negative. 
    
    0x02 is prepended for positive y values
    0x03 is prepended for negative ones. 
    
    If the last binary digit of the y coordinate is 0, then the number is even, which corresponds to positive. If it is 1, then it is negative. 
    The 32 byte compressed version of the public key becomes:

    02 4b4cc587 e8a11262 84673670 b3f8002b 8bed7ff6 0bb9cefc 35698aba faf12039
*/

publicKeyComp = curvePt.getEncoded(true) //false forces compressed public key
console.log('publicKey compressed: ', publicKeyComp.toString('hex'))



/** INCOMPLETE
    FIO/EOSIO public keys are (sort of) WIF encoded

    The main difference is that there is no prefix byte and the checksum isn't a SHA256(SHA256), it's a RipeMD160.

    Wallet Import Format is an encoding for a private EDSA key. EOS uses the same version, checksum, and encoding 
    scheme as the Bitcoin WIF addresses and should be compatible with existing libraries.

    1. A compressed (??) public key is used. This is 32 bytes long (shown here as hex).
    02 4b4cc587 e8a11262 84673670 b3f8002b 8bed7ff6 0bb9cefc 35698aba faf12039

    2. Perform a binary RipeMD160 hash on the versioned key.
    ce145d282834c009c24410812a60588c1085b63d65a7effc2e0a5e3a2e21b236

    3. Take the first 4 bytes of the RipeMD160 hash, this is the checksum.
    ce145d28

    6. Add the 4 checksum bytes to the extended key from step 1 ??
    02 4b4cc587 e8a11262 84673670 b3f8002b 8bed7ff6 0bb9cefc 35698aba faf12039 ce145d28

    7. Base58 encode the binary data from step 6.

*/


/** INCOMPLETE
 
    Using BIP44 Extended Keys

    See: https://developer.bitcoin.org/devguide/wallets.html#hierarchical-deterministic-key-creation
    https://bitcoin.stackexchange.com/questions/62533/key-derivation-in-hd-wallets-using-the-extended-private-key-vs-hardened-derivati

    https://bitcoin.stackexchange.com/questions/101892/how-to-convert-hd-wallet-master-key-to-extended-key-and-child-keys-in-javascript
    

    To derive a number of child keys from a parent key, you extend both private and public keys first with an extra 256 bits of entropy.
    This extension is called the "chain code".

    We represent an extended private key as (k, c), with k the normal private key, and c the chain code.

    Extended public and private keys are serialized as follows:

4 byte: version bytes (mainnet: 0x0488B21E public, 0x0488ADE4 private; testnet: 0x043587CF public, 0x04358394 private)
1 byte: depth: 0x00 for master nodes, 0x01 for level-1 derived keys, ....
4 bytes: the fingerprint of the parent's key (0x00000000 if master key)
4 bytes: child number. This is ser32(i) for i in xi = xpar/i, with xi the key being serialized. (0x00000000 if master key)
32 bytes: the chain code
33 bytes: the public key or private key data (serP(K) for public keys, 0x00 || ser256(k) for private keys)
This 78 byte structure can be encoded like other Bitcoin data in Base58, by first adding 32 checksum bits (derived from the double SHA-256 checksum), 
and then converting to the Base58 representation. This results in a Base58-encoded string of up to 112 characters. 
Because of the choice of the version bytes, the Base58 representation will start with "xprv" or "xpub" on mainnet, "tprv" or "tpub" on testnet.

    FIO BIP32 Derivation Path: m/44'/235'/0'/0

    Derive the BIP32 extended private Key

    Derive the BIP32 extended public key

    Derive address m/44'/235'/0'/0/0'

    Derive address m/44'/235'/0'/0/1'
 */
const crypto = require('crypto');

//const master_key_hex = 'ec4a3307bfc8dfa90d23c92bc8a68f5dbf3629ca92f43530748711979b992a38';
//const chain_code_hex = 'abfbc73691eaad7ca4eb5e25bc51c5804af221cc27a23460634498497f92c92c';

//const seed = 'valley alien library bread worry brother bundle hammer loyal barely dune brave'
privKeyBuf = createHash('sha512').update(seed).digest();  // Creates a 128 char buffer (two 32 byte random values)
privKeyStr = privKeyBuf.toString('hex')
console.log('privKeyBuf length: ', privKeyBuf.length)
console.log('privKey String: ', privKeyStr);
console.log('privKey String length: ', privKeyStr.length);

console.log('privKey Buffer: ', privKeyBuf);
master_key_hex = privKeyBuf.toString('hex').substring(0, 64);
console.log('master_key_hex String: ', master_key_hex);
console.log('master_key_hex String length: ', master_key_hex.length);

chain_code_hex = privKeyBuf.toString('hex').substring(64, 128);
console.log('string length: ', privKeyBuf.toString('hex').length);
console.log('chain_code_hex String: ', chain_code_hex);
console.log('chain_code_hex String length: ', chain_code_hex.length);

// the 78 bytes of data
var data = '0488ade4';
data += '00';  // depth
data += '00000000';
data += '00000000';
data += chain_code_hex;
data += '00' + master_key_hex;

// add the checksum
const hash_1 = crypto.createHash('sha256');
var sha_256_1 = hash_1.update(data, 'hex').digest('hex');
const hash_2 = crypto.createHash('sha256');
var sha_256_2 = hash_2.update(sha_256_1, 'hex').digest('hex');


var data_with_checksum = data + sha_256_2.substring(0, 8);
var result = base58.encode(Buffer.from(data_with_checksum, 'hex'));

console.log('BIP32 Extended Key: ', result);



//string
//stringP =  keyUtils.checkEncode(toBuffer())

//const check = [keyBuffer]
//const checksum = hash.ripemd160(Buffer.concat(check)).slice(0, 4)
//return base58.encode(Buffer.concat([keyBuffer, checksum]))

//uncompressed
////var buf = Q.getEncoded(false);
//var point = ecurve.Point.decodeFrom(secp256k1, buf);
////console.log('point: ', point)
//uncompPub =  PublicKey.fromPoint(point);
//console.log('uncompPub: ', uncompPub)

//hex
//hexp = point.toBuffer().toString('hex');
//console.log('hexp: ', hexp)





/**
    Address generation

    There are multiple Bitcoin address types, currently P2SH or pay-to-script hash is the default for most wallets. 
    P2PKH was the predecessor and stands for Pay to Public Key Hash. Scripts give you more functionality, which is one 
    reason why they are more popular. We’ll first generate a P2PKH original format address, followed by the now standardP2SH .

    Hash

    The public key from the previous output is hashed first using sha256 and then hashed using ripemd160 . This shortens the 
    number of output bytes and ensures that in case there is some unforeseen relationship between elliptic curve and sha256, 
    another unrelated hash function would significantly increase the difficulty of reversing the operation:

    Encoding

    Now that we have hashed the public key, we now perform base58check encoding. Base58check allows the hash to be displayed 
    in a more compact way (using more letters of the alphabet) while avoiding characters that could be confused with each other 
    such as 0 and O where a typo could result in your losing your funds. A checksum is applied to make sure the address was 
    transmitted correctly without any data corruption such as mistyping the address.
 */