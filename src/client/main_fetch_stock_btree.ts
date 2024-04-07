/**
 * Hello world
 */

import {
  establishConnection,
  establishPayer,
  checkProgram,
  sayHello,
  mapStockPDA,
  getStockQuote, 
  getBTreeMap,
  fetchLiveQuotes,
  quotes,
  FetchUserPortfolios,
  FetchFSOPPortfolioForUser,
} from './hello_world';

async function main() {

    await establishConnection();

    await establishPayer();

    await checkProgram("BBK-Stocks");
    const stockPubkey = mapStockPDA.get("BBK-Stocks");
    await getBTreeMap("BBK-Stocks");

    console.log('Success');

}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);
