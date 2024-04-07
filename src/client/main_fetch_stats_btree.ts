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
  getBuybakStatisticsMap,
  fetchLiveQuotes,
  quotes,
  FetchUserPortfolios,
  FetchFSOPPortfolioForUser,
} from './hello_world';

async function main() {

    await establishConnection();

    await establishPayer();

    await checkProgram("BBK-Stats");
    const statsPubkey = mapStockPDA.get("BBK-Stats");
    await getBuybakStatisticsMap("BBK-Stats");

    console.log('Success');

}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);
