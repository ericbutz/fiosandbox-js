const hash = require('./hash');

/**
 * Example key:
 * Public Key: FIO573LK5X8pCmDdwsiw64HPxvTP7aDF579Zz3PtnJiRjXpzp6YkM
 * Private key: 5JxLFdMPyPiF8r9H1VRE4ZWueSNFNGTLFRegjspJ5u8KnH3A9Qg
 * FIO Internal Account (actor name): wzvfmmwo42nk
 *
 * A FIO private key is WIF encoded. To get the raw private key, base58 decode the key. 
 * Once decoded, you will find a prefix byte on the front (0x80) which is the same as Bitcoin.
 * More info here:
 * https://en.bitcoin.it/wiki/Wallet_import_format
 * https://eosio.stackexchange.com/questions/36/what-are-the-formats-for-the-pub-key-priv-key-signatures
 * 
 * An EOS public key on the other hand is "sort of" WIF encoded, but not completely so. 
 * The main difference with an EOS public key is that there is no prefix byte and the checksum isn't a SHA256(SHA256), it's a RipeMD160.
 * 
 * 1. Take the WIF format: FIO573LK5X8pCmDdwsiw64HPxvTP7aDF579Zz3PtnJiRjXpzp6YkM
 * 2. Remove "FIO": 573LK5X8pCmDdwsiw64HPxvTP7aDF579Zz3PtnJiRjXpzp6YkM
 * 3. Base58 decode: 
 * 4. Trim off last 4 checksum bytes:
 * 5. Should be left with 33 byte compressed string:
 * 6. Ripemd hash this string. You get: 
 * 7. The first for bytes of this string are the checksum:
 * 8. Compare the the previous checksum bytes.
 */


 /**
  @arg {Buffer} keyString data
  @arg {string} keyType = sha256x2, K1, etc
  @return {string} checksum encoded base58 string
*/
function checkDecode(keyString, keyType = null) {
    assert(keyString != null, 'private key expected')
    const buffer = new Buffer(base58.decode(keyString))
    const checksum = buffer.slice(-4)
    const key = buffer.slice(0, -4)

    let newCheck
    const check = [key]
    if(keyType) {
        check.push(Buffer.from(keyType))
    }
    newCheck = hash.ripemd160(Buffer.concat(check)).slice(0, 4) //PVT

    if (checksum.toString() !== newCheck.toString()) {
        throw new Error('Invalid checksum, ' +
            `${checksum.toString('hex')} != ${newCheck.toString('hex')}`
        )
    }

    return key
}


// EOS generates private keys from bip39 mnemonic phrases
    static createPrivateKey(entropy) {
        return __awaiter(this, void 0, void 0, function* () {
            const bip39 = require('bip39');
            const mnemonic = bip39.entropyToMnemonic(entropy);
            return yield FIOSDK.createPrivateKeyMnemonic(mnemonic);
        });
    }


    /**
     * Create a FIO private key.
     *
     * @param mnemonic mnemonic used to generate a random unique private key.
     * @example real flame win provide layer trigger soda erode upset rate beef wrist fame design merit
     *
     * @returns New FIO private key
     */
    static createPrivateKeyMnemonic(mnemonic) {
        return __awaiter(this, void 0, void 0, function* () {
            const hdkey = require('hdkey');
            const wif = require('wif');
            const bip39 = require('bip39');
            const seedBytes = yield bip39.mnemonicToSeed(mnemonic);  // Creates a binary seed from the mnemonic. 
            const seed = yield seedBytes.toString('hex');
            const master = hdkey.fromMasterSeed(new Buffer(seed, 'hex'));
            const node = master.derive('m/44\'/235\'/0\'/0/0');
            const fioKey = wif.encode(128, node._privateKey, false);
            return { fioKey, mnemonic };
        });
    }

    /**
     * Create a FIO public key.
     *
     * @param fioPrivateKey FIO private key.
     *
     * @returns FIO public key derived from the FIO private key.
     */
    static derivedPublicKey(fioPrivateKey) {
        const publicKey = Ecc.privateToPublic(fioPrivateKey);
        return { publicKey };
    }