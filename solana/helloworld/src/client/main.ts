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
         .usage("Usage: -i <instruction> -p <price> -q <quantity> -s <stock>")
         .option("i", { alias: "instruction", describe: "One|Two|Three", type: "string", demandOption: true })
         .option("p", { alias: "price", describe: "Price", type: "string", demandOption: true })
         .option("q", { alias: "quantity", describe: "Quantity", type: "string", demandOption: true })
         .option("s", { alias: "stock", describe: "Stock", type: "string", demandOption: true })
         .argv;

  console.log("Let's say hello to a Solana account..., " + options.instruction + ", pair: " + options.pair + ", name: " + options.name);

  await establishConnection();

  await establishPayer();

  await checkProgram(options.stock);

  const stockPubkey = mapStockPDA.get(options.stock);

  if ( stockPubkey !== undefined)
  {
    await sayHello(stockPubkey, parseInt(options.instruction, 10), parseInt(options.price, 10), parseInt(options.quantity, 10), options.stock);
    await getStockQuote(options.stock);
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
