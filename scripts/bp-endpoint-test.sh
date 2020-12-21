#!/bin/bash
while read node; do
echo $node; curl -s -XPOST https://api.fio.alohaeos.com:443/v1/chain/get_info | jq -r '"\(.chain_id)"' 
done << EOF
api.fio.alohaeos.com:443
api.fio.currencyhub.io:443
api.fio.eosdetroit.io:443
fio-mainnet.eosblocksmith.io:443
fio.acherontrading.com:443
fio.cryptolions.io:443
fio.eos.barcelona:443
fio.eosargentina.io:443
fio.eoscannon.io:443
fio.eosdac.io:443
fio.eosdublin.io:443
fio.eosphere.io:443
fio.eossweden.org
fio.eossweden.org:443
fio.eosusa.news:443
fio.eu.eosamsterdam.net:443
fio.greymass.com:443
fio.maltablock.org:443
fio.zenblocks.io:443
EOF