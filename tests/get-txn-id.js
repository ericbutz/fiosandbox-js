const createHash = require('create-hash')

function hexStringToByte(str) {
  if (!str) {
    return new Uint8Array();
  }
  
  var a = [];
  for (var i = 0, len = str.length; i < len; i+=2) {
    a.push(parseInt(str.substr(i,2),16));
  }
  
  return new Uint8Array(a);
}

// Example transaction

const txn =   {
  signatures: [
    'SIG_K1_Kezyrdhxy65ej8Uir1Kts3gCp8RQF5UhuQavc1rU3CdEA4V4nmxM95iW9F6mAyMs6YzsAk8CXCpY9GhuApVkw5FWG3giGd'
  ],
  compression: 0,
  packed_context_free_data: '',
  packed_trx: '22858c60c9d49a6d024d0000000001003056372503a85b0000c6eaa664523201b0bb16f856dde77200000000a8ed32326a116574657374364066696f746573746e657402034243480342434818626974636f696e636173683a617364666173646661736466044441534804444153480c6173646661736466617364660046c32300000000b0bb16f856dde7720e726577617264734077616c6c657400'
}

const serializedTransaction = hexStringToByte(txn.packed_trx)
trx_id = createHash('sha256').update(serializedTransaction).digest('hex')
console.log('trx_id ', trx_id)





