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
} from './hello_world';

const yargs = require("yargs");
import {fetch_watchlist} from "./fetch_watchlist";


async function main() {

    const options = yargs
         .usage("Usage: -i <instruction> -u <uname>, -n <fname>, -e <email>, -p <phone>, -a <address>, -s <symbol>, -f <fsop>")
         .option("i", { alias: "instruction", describe: "One|Two|Three", type: "string", demandOption: true })
         .option("u", { alias: "username", describe: "username", type: "string", demandOption: true })
         .option("n", { alias: "fullname", describe: "fullname", type: "string", demandOption: true })
         .option("e", { alias: "email", describe: "email", type: "string", demandOption: true })
         .option("p", { alias: "phone", describe: "phone", type: "string", demandOption: true })
         .option("a", { alias: "address", describe: "address", type: "string", demandOption: true })
         .option("s", { alias: "symbol", describe: "symbol", type: "string", demandOption: true })
         .option("f", { alias: "fsop", describe: "fsop", type: "string", demandOption: true })
         .argv;

    console.log(
        "Let's say hello to a Solana account..., " + options.instruction + 
        ", username: " + options.username + 
        ", fullname: " + options.fullname + 
        ", email: " + options.email + 
        ", phone: " + options.phone + 
        ", address: " + options.address + 
        ", symbol: " + options.symbol + 
        ", fsop: " + options.fsop);

    await establishConnection();

    await establishPayer();

    if (options.instruction === "6")
    {
            await checkProgram("BBK-Users");
            const userPubkey = mapStockPDA.get("BBK-Users");
            if ( userPubkey !== undefined)
            {
                await InitUserPortfolio(userPubkey, parseInt(options.instruction, 10), options.username, options.fullname, options.email, options.phone, options.address, parseInt(options.fsop, 10), options.symbol);
            }
    }
    else if (options.instruction === "7")
    {
            await checkProgram("BBK-Users");
            const userPubkey = mapStockPDA.get("BBK-Users");
            if ( userPubkey !== undefined)
            {
                await InitUserPortfolio(userPubkey, parseInt(options.instruction, 10), options.username, options.fullname, options.email, options.phone, options.address, parseInt(options.fsop, 10), options.symbol);
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
