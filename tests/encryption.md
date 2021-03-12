https://medium.com/coinmonks/how-to-generate-a-bitcoin-address-step-by-step-9d7fcbf1ad0b

Private keys can be any 256 bit (32 byte) value from 0x1 to 0xFFFF FFFF FFFF FFFF FFFF FFFF FFFF FFFF BAAE DCE6 AF48 A03B BFD2 5E8C D036 4140 

A common (but not the most secure) way of creating a private key is to start with a seed, such as a group of words or passphrases picked at random. This seed is then passed through the SHA256 algorithm, which will always conveniently generate a 256 bit value. 

This private key is in hexadecimal or base 16. Every 2 digits represents 8 bits or 1 byte. So, with 64 characters, there are 256 bits total.

Public keys are generated from the private keys in Bitcoin using elliptic curve (secp256k1) multiplication using the formula K = k * G, where K is the public key, k is the private key, and G is a constant called the Generator Point⁴, which for secp256k1 is equal to:

04 79BE667E F9DCBBAC 55A06295 CE870B07 029BFCDB 2DCE28D9 59F2815B 16F81798 483ADA77 26A3C465 5DA4FBFC 0E1108A8 FD17B448 A6855419 9C47D08F FB10D4B8

Example: 
04 3cba1f4d 12d1ce0b ced72537 3769b226 2c6daa97 be6a0588 cfec8ce1 a5f0bd09 
   2f56b549 2adbfc57 0b15644c 74cc8a48 74ed20df e47e5dce 2e08601d 6f11f5a4

This public key contains a prefix 0x04 and the x and y coordinates on the elliptic curve secp256k1, respectively.

Compressed public keys:

Most wallets and nodes implement compressed public key as a default format because it is half as big as an uncompressed key, saving blockchain space. To convert from an uncompressed public key to a compressed public key, you can omit the y value because the y value can be solved for using the equation of the elliptic curve: y² = x³ + 7. Since the equation solves for y², the right side of the equation could be either positive or negative. So, 0x02 is prepended for positive y values, and 0x03 is prepended for negative ones. If the last binary digit of the y coordinate is 0, then the number is even, which corresponds to positive. If it is 1, then it is negative. The compressed version of the public key becomes:

023cba1f4d12d1ce0bced725373769b2262c6daa97be6a0588cfec8ce1a5f0bd09

The prefix is 0x02 because the y coordinate ends in 0xa4, which is even, therefore positive.

Address generation

There are multiple Bitcoin address types, currently P2SH or pay-to-script hash is the default for most wallets. P2PKH was the predecessor and stands for Pay to Public Key Hash. Scripts give you more functionality, which is one reason why they are more popular. We’ll first generate a P2PKH original format address, followed by the now standardP2SH .

Hash

The public key from the previous output is hashed first using sha256 and then hashed using ripemd160 . This shortens the number of output bytes and ensures that in case there is some unforeseen relationship between elliptic curve and sha256, another unrelated hash function would significantly increase the difficulty of reversing the operation:

Encoding

Now that we have hashed the public key, we now perform base58check encoding. Base58check allows the hash to be displayed in a more compact way (using more letters of the alphabet) while avoiding characters that could be confused with each other such as 0 and O where a typo could result in your losing your funds. A checksum is applied to make sure the address was transmitted correctly without any data corruption such as mistyping the address.

https://miro.medium.com/max/2400/1*GCp8FYepAEXgAuEqEk8D3w.png
