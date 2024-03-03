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
         .usage("Usage: -i <instruction> -v <value>")
         .option("i", { alias: "instruction", describe: "One|Two|Three", type: "string", demandOption: true })
         .option("v", { alias: "value", describe: "Value", type: "string", demandOption: true })
         .argv;

  console.log("Let's say hello to a Solana account..., " + options.instruction + ", value: " + options.value);

  // Establish connection to the cluster
  await establishConnection();

  // Determine who pays for the fees
  await establishPayer();

  // Check if the program has been deployed
  await checkProgram();

  // Say hello to an account
  await sayHello(parseInt(options.instruction, 10), parseInt(options.value, 10));

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
