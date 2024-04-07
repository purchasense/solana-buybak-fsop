#!/bin/bash
PATH=/Users/sameer/.nvm/versions/node/v14.0.0/bin:.:$PATH
nvm install 14.0.0
cd /Users/sameer/gitrepo/solana-buybak-fsop
ts-node src/client/main_live_stock_quotes.ts -p 0   -q 10000 -r "Starbucks" -s "SBUX" -v 20000
