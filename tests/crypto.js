/*
const { createHmac } = require('crypto');

const secret = 'abcdefg';
const hash = createHmac('sha256', secret)
  .update('I love cupcakes')
  .digest('hex');
console.log(hash);
*/

const crypto = require('crypto');
const buffer = require('buffer');

// Create a private key
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'sect239k1',
  publicKeyEncoding: { type: 'spki', format: 'der' },
  privateKeyEncoding: { type: 'pkcs8', format: 'der' }
});

privateKey2 = privateKey.toString('hex')
console.log('privateKey2: ', privateKey2)

// Convert string to buffer 
const data = Buffer.from("I Love GeeksForGeeks");


// Sign the data and returned signature in buffer 
//testeb = crypto.sign("SHA256", data, privateKey2);
const signer = crypto.createSign('SHA256')
console.log('signer: ', signer)
newsign = signer.update(data)
console.log('newsign: ', newsign.sign)
const signature = signer.sign("SHA256", data, privateKey2);

// Convert returned buffer to base64
//const signature = sign.toString('base64');

// Printing the signature 
//console.log('signature: ', signature);