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
} from './hello_world';

const yargs = require("yargs");


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

  if ((options.instruction === "3") || (options.instruction === "4"))
  {
    await checkProgram("BBK-Stocks");
  }
  else
  {
    await checkProgram(options.retailer);
  }

  const stockPubkey = mapStockPDA.get(((options.instruction === "3") || (options.instruction === "4"))?"BBK-Stocks":options.retailer);

  if ( stockPubkey !== undefined)
  {
    await sayHello(stockPubkey, parseInt(options.instruction, 10), parseInt(options.price, 10), parseInt(options.quantity, 10), options.retailer, options.stock);
    await getStockQuote(options.retailer);
  }

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

    console.log('Success');
}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);
