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
  InitUserPortfolio,
  FetchUserPortfolios,
  FetchFSOPPortfolioForUser,
} from './hello_world';

const yargs = require("yargs");
import {fetch_watchlist} from "./fetch_watchlist";


async function main() {

    const options = yargs
         .usage("Usage: -i <instruction> -u <uname>")
         .option("i", { alias: "instruction", describe: "One|Two|Three", type: "string", demandOption: true })
         .option("u", { alias: "username", describe: "username", type: "string", demandOption: true })
         .argv;

    console.log(
        "Let's say hello to a Solana account..., " + options.instruction + 
        ", username: " + options.username
    );

    await establishConnection();

    await establishPayer();

    if (options.instruction === "6")
    {
            await checkProgram("BBK-Users");
            const userPubkey = mapStockPDA.get("BBK-Users");
            if ( userPubkey !== undefined)
            {
                await FetchUserPortfolios(userPubkey);
            }
    }
    else if (options.instruction === "7")
    {
            await checkProgram(options.username);
            const userPubkey = mapStockPDA.get(options.username);
            if ( userPubkey !== undefined)
            {
                await FetchFSOPPortfolioForUser(userPubkey);
            }
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
