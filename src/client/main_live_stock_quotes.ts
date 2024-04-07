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
} from './hello_world';

const yargs = require("yargs");

async function main() {

    const options = yargs
         .usage("Usage: -i <instruction> -p <price> -q <quantity> -r <retailer> -s <stock>")
         .option("p", { alias: "price", describe: "Price", type: "string", demandOption: true })
         .option("q", { alias: "quantity", describe: "Quantity", type: "string", demandOption: true })
         .option("r", { alias: "retailer", describe: "Retailer", type: "string", demandOption: true })
         .option("s", { alias: "stock", describe: "Stock", type: "string", demandOption: true })
         .argv;

    console.log("Let's say hello to a Solana account..., " + ", price: " + options.price + ", quantity: " + options.quantity + ", retailer: " + options.retailer + ", stock: " + options.stock);

    await establishConnection();

    await establishPayer();

        await checkProgram("BBK-Stocks");
        const stockPubkey = mapStockPDA.get("BBK-Stocks");
        if ( stockPubkey !== undefined)
        {
            await fetchLiveQuotes();
            for (const asset of quotes) {
                await sayHello(
                    stockPubkey,
                    8,                                                          // ClientPairInstruction.UpdateStockPrices
                    Math.ceil(40000.00 + 10000.0 * parseFloat(asset.price)),
                    10000,
                    asset.name,
                    asset.stockCode
                );
            };
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
