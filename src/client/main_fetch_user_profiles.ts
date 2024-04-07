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

const yargs = require("yargs");
import {fetch_watchlist} from "./fetch_watchlist";


async function main() {

    const options = yargs
         .usage("Usage: -u <uname>")
         .option("u", { alias: "username", describe: "username", type: "string", demandOption: true })
         .argv;

    console.log(
        "Let's say hello to a Solana account..., " + 
        ", username: " + options.username
    );

    await establishConnection();

    await establishPayer();

            await checkProgram("BBK-Users");
            const userPubkey = mapStockPDA.get("BBK-Users");
            if ( userPubkey !== undefined)
            {
                await FetchUserPortfolios(userPubkey);
            }
    console.log('Success');

}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);
