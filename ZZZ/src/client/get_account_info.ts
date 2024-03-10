/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { serialize, deserialize, deserializeUnchecked } from "borsh";
import { Buffer } from "buffer";
import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  GetProgramAccountsFilter,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import * as borsh from 'borsh';
import path from 'path';
import {getPayer, getRpcUrl, createKeypairFromFile} from './utils';

/**
 * Connection to the network
 */
let connection: Connection;

/**
 * Keypair associated to the fees' payer
 */
let payer: Keypair;

/**
 * Hello world's program id
 */
let programId: PublicKey;

/**
 * Path to program files
 */
const PROGRAM_PATH = path.resolve(__dirname, '../../dist/program');

/**
 * Path to program shared object file which should be deployed on chain.
 * This file is created when running either:
 *   - `npm run build:program-c`
 *   - `npm run build:program-rust`
 */
const PROGRAM_SO_PATH = path.join(PROGRAM_PATH, 'solana_buybak_fsop.so');

/**
 * Path to the keypair of the deployed program.
 * This file is created when running `solana program deploy dist/program/solana_buybak_fsop.so`
 */
const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, 'solana_buybak_fsop-keypair.json');



class MessagingAccount {
    price: number = 0;
    quantity: number = 0;
    stock: String = "";
    constructor(fields: {price: number, quantity: number, stock: String} | undefined = undefined) {
        if (fields) {
            this.price = fields.price;
            this.quantity = fields.quantity;
            this.stock = fields.stock;
        }
    }
}

const MessagingSchema = new Map([
    [MessagingAccount, 
        {
            kind: 'struct', 
            fields: [
                ['price', 'u32'],
                ['quantity', 'u32'],
                ['stock', 'string'],
            ]
        }
    ],
]);



// Flexible class that takes properties and imbues them
// to the object instance
/*
class Assignable {
  constructor(properties) {
    Object.keys(properties).map((key) => {
      return (this[key] = properties[key]);
    });
  }
}
*/


const MESSAGING_SIZE = 64;

/**
 * Establish a connection to the cluster
 */
export async function establishConnection(): Promise<void> {
  const rpcUrl = await getRpcUrl();
  connection = new Connection(rpcUrl, 'confirmed');
  const version = await connection.getVersion();
  console.log('Connection to cluster established:', rpcUrl, version);
}

/**
 * Establish an account to pay for everything
 */
export async function establishPayer(): Promise<void> {
  let fees = 0;

    // Read program id from keypair file
  try {
        const programKeypair = await createKeypairFromFile(PROGRAM_KEYPAIR_PATH);
        programId = programKeypair.publicKey;
  } catch (err) {
        const errMsg = (err as Error).message;
        throw new Error( `Failed to read program keypair at '${PROGRAM_KEYPAIR_PATH}' due to error: ${errMsg}. Program may need to be deployed with \`solana program deploy dist/program/solana_buybak_fsop.so\``,);
  }

  if (!payer) {
    const {feeCalculator} = await connection.getRecentBlockhash();

    // Calculate the cost to fund the greeter account
    fees += await connection.getMinimumBalanceForRentExemption(MESSAGING_SIZE);

    // Calculate the cost of sending transactions
    fees += feeCalculator.lamportsPerSignature * 100; // wag

    payer = await getPayer();
  }

  let lamports = await connection.getBalance(payer.publicKey);
  if (lamports < fees) {
    // If current balance is not enough to pay for fees, request an airdrop
    const sig = await connection.requestAirdrop(
      payer.publicKey,
      fees - lamports,
    );
    await connection.confirmTransaction(sig);
    lamports = await connection.getBalance(payer.publicKey);
  }

  console.log(
    'Using account',
    payer.publicKey.toBase58(),
    'containing',
    lamports / LAMPORTS_PER_SOL,
    'SOL to pay for fees',
  );
}

/**
 * Report the number of times the greeted account has been said hello to
 */
export async function getStockQuote(stock_seed: string): Promise<void> {

    const greetedPubkey = await PublicKey.createWithSeed(
        payer.publicKey,
        stock_seed,
        programId,
    );

    const accountInfo = await connection.getAccountInfo(greetedPubkey);
    if (accountInfo === null) {
        throw 'Error: cannot find the greeted account';
    }
    // console.log( {accountInfo});

    const buffer = Buffer.from(accountInfo.data);
    // console.log({buffer});

    /*
     * 1. read the firs t8 bytes.
     * 2. Read the packet into new packet.
     * 3. deserialize
     */

    const packetLen = buffer.readInt32LE(0);
    console.log('packetLen: ' + packetLen);

    let packet = buffer.slice(8,8+packetLen);
    // console.log( {packet});

    const msg = borsh.deserialize(
        MessagingSchema,
        MessagingAccount,
        packet
    );
    console.log( {msg});
    console.log( stock_seed + ": " + greetedPubkey.toBase58());
}


const yargs = require("yargs");


async function main() {

    const options = yargs
         .usage("Usage: -s <stock>")
         .option("s", { alias: "stock", describe: "Stock", type: "string", demandOption: true })
         .argv;

    await establishConnection();
    await establishPayer();
    await getStockQuote(options.stock);

}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);
