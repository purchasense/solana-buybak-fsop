/**
 * Hello world
 */

import {
  establishConnection,
  establishPayer,
  checkProgram,
  sayHello,
  reportGreetings,
} from './hello_world';

const yargs = require("yargs");


async function main() {

    const options = yargs
         .usage("Usage: -i <instruction> -p <pair> -n <name>")
         .option("i", { alias: "instruction", describe: "One|Two|Three", type: "string", demandOption: true })
         .option("p", { alias: "pair", describe: "Pair", type: "string", demandOption: true })
         .option("n", { alias: "name", describe: "Name", type: "string", demandOption: true })
         .argv;

  console.log("Let's say hello to a Solana account..., " + options.instruction + ", pair: " + options.pair + ", name: " + options.name);

  // Establish connection to the cluster
  await establishConnection();

  // Determine who pays for the fees
  await establishPayer();

  // Check if the program has been deployed
  await checkProgram();

  // Say hello to an account
  await sayHello(parseInt(options.instruction, 10), parseInt(options.pair, 10), options.name);

  // Find out how many times that account has been greeted
  await reportGreetings();

  console.log('Success');
}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);
