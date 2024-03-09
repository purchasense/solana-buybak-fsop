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
import {fetch_watchlist} from "./fetch_watchlist";


async function main() {

    const options = yargs
         .usage("Usage: -i <instruction> -p <price> -q <quantity> -r <retailer> -s <stock>")
         .option("i", { alias: "instruction", describe: "One|Two|Three", type: "string", demandOption: true })
         .option("p", { alias: "price", describe: "Price", type: "string", demandOption: true })
         .option("q", { alias: "quantity", describe: "Quantity", type: "string", demandOption: true })
         .option("r", { alias: "retailer", describe: "Retailer", type: "string", demandOption: true })
         .option("s", { alias: "stock", describe: "Stock", type: "string", demandOption: true })
         .argv;

    console.log("Let's say hello to a Solana account..., " + options.instruction + ", price: " + options.price + ", quantity: " + options.quantity + ", retailer: " + options.retailer + ", stock: " + options.stock);

    await establishConnection();

    await establishPayer();

    if ( options.instruction === "5")
    {
        await checkProgram("BBK-Stocks");
        const stockPubkey = mapStockPDA.get("BBK-Stocks");
        if ( stockPubkey !== undefined)
        {
            await fetchLiveQuotes();
            for (const asset of quotes) {
                await sayHello(
                    stockPubkey,
                    3,
                    Math.ceil(10000.0 * parseFloat(asset.price)),
                    100,
                    asset.stockCode,
                    asset.name
                );
            };
        }
    }
    else
    {
        if ((options.instruction === "3") || (options.instruction === "4"))
        {
            await checkProgram("BBK-Stocks");
        }
        else
        {
            await checkProgram(options.retailer);
        }

        const stockPubkey = mapStockPDA.get(((options.instruction === "3") || (options.instruction === "4"))?"BBK-Stocks":options.retailer);

        if ( (stockPubkey !== undefined) && ((options.instruction === "1") || (options.instruction === "2")))
        {
            await sayHello(stockPubkey, parseInt(options.instruction, 10), parseInt(options.price, 10), parseInt(options.quantity, 10), options.retailer, options.stock);
        }

        if ( options.instruction === "5")
        {
        }
        else if ( (options.instruction === "3") || (options.instruction === "4"))
        {
            await getBTreeMap("BBK-Stocks");
        }
        else
        {
            let stocks = ["HomeDepot", "Chipotle", "Target", "Walgreens", "CVS Health", "Riteaid", "Ace Hardware", "Starbucks", "Dunkin Donuts"];
            await getStockQuote("HomeDepot");
            await getStockQuote("Chipotle");
            await getStockQuote("Target");
            await getStockQuote("Walgreens");
            await getStockQuote("CVS Health");
            await getStockQuote("Riteaid");
            await getStockQuote("Ace Hardware");
            await getStockQuote("Starbucks");
            await getStockQuote("Dunkin Donuts");

        }

    } // else instruction = 1, 2, 3, 4

    console.log('Success');

}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);
