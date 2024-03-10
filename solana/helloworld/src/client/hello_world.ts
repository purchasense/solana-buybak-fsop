/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { serialize, deserialize, deserializeUnchecked } from "borsh";
import { Buffer } from "buffer";
import * as I from 'immutable';
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
import fs from 'mz/fs';
import path from 'path';
import * as borsh from 'borsh';
import { fetch_watchlist } from "./fetch_watchlist";
import axios from "axios";

import {getPayer, getRpcUrl, createKeypairFromFile} from './utils';

import BN = require("bn.js");

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
 * The public key of the account we are saying hello to
 */
export let mapStockPDA = I.Map<string, PublicKey>();

/**
 * Path to program files
 */
const PROGRAM_PATH = path.resolve(__dirname, '../program-rust/target/deploy');

/**
 * Path to program shared object file which should be deployed on chain.
 * This file is created when running either:
 *   - `npm run build:program-c`
 *   - `npm run build:program-rust`
 */
const PROGRAM_SO_PATH = path.join(PROGRAM_PATH, 'helloworld.so');

/**
 * Path to the keypair of the deployed program.
 * This file is created when running `solana program deploy dist/program/helloworld.so`
 */
const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, 'helloworld-keypair.json');



class MessagingAccount {
    price: number = 0;
    quantity: number = 0;
    retailer: String = "";
    stock: String = "";
    constructor(fields: {price: number, quantity: number, retailer: String, stock: String} | undefined = undefined) {
        if (fields) {
            this.price = fields.price;
            this.quantity = fields.quantity;
            this.retailer = fields.retailer;
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
                ['retailer', 'string'],
                ['stock', 'string'],
            ]
        }
    ],
]);



/*
// Flexible class that takes properties and imbues them
// to the object instance
class Assignable {
  constructor(properties) {
    Object.keys(properties).map((key: string) => {
      return (this[key] = properties[key]);
    });
  }
}
class ClientPairPayload extends Assignable {}

*/


class ClientPairPayload {
  variant = 0;
  price = 0;
  quantity = 0;
  retailer = "";
  stock = "";


  constructor(fields: {variant: number, price: number, quantity: number, retailer: string, stock: string} | undefined = undefined) {
    if (fields) {
      this.variant = fields.variant;
      this.price = fields.price;
      this.quantity = fields.quantity;
      this.retailer = fields.retailer;
      this.stock = fields.stock;
    }
  }
}

// Borsh needs a schema describing the payload
const payloadSchema = new Map([
  [
    ClientPairPayload,
    {
      kind: "struct",
      fields: [
        ["variant", "u8"],
        ["price", "u32"],
        ["quantity", "u32"],
        ["retailer", "string"],
        ["stock", "string"],
      ],
    },
  ],
]);

class InitUserPayload {
  variant = 0;
  username = "";
  fullname = "";
  email = "";
  phone = "";
  address = "";


  constructor(fields: {variant: number, username: string, fullname: string, email: string, phone: string, address: string} | undefined = undefined) {
    if (fields) {
      this.variant = fields.variant;
      this.username = fields.username;
      this.fullname = fields.fullname;
      this.email = fields.email;
      this.phone = fields.phone;
      this.address = fields.address;
    }
  }
}

// Borsh needs a schema describing the payload
const InitUserSchema = new Map([
  [
    InitUserPayload,
    {
      kind: "struct",
      fields: [
        ["variant", "u8"],
        ["username", "string"],
        ["fullname", "string"],
        ["email", "string"],
        ["phone", "string"],
        ["address", "string"],
      ],
    },
  ],
]);

class UpdateUserPayload {
  variant = 0;
  username = "";
  fsop = 0;
  stock = "";


  constructor(fields: {variant: number, username: string, fsop: number, stock: string} | undefined = undefined) {
    if (fields) {
      this.variant = fields.variant;
      this.username = fields.username;
      this.fsop = fields.fsop;
      this.stock = fields.stock;
    }
  }
}

// Borsh needs a schema describing the payload
const UpdateUserSchema = new Map([
  [
    UpdateUserPayload,
    {
      kind: "struct",
      fields: [
        ["variant", "u8"],
        ["username", "string"],
        ["fsop", "u32"],
        ["stock", "string"],
      ],
    },
  ],
]);

// Instruction variant indexes
enum ClientPairInstruction {
    ClientOne = 0,
    ClientTwo,
    ClientThree,
    InitializeAccount,
    FindRetailer,
    InitUserPortfolio,
    UpdateUserPortfolio,
}

const MESSAGING_SIZE = 1024;

/*
const MESSAGING_SIZE = 8 + borsh.serialize(
  MessagingSchema,
  new MessagingAccount(),
).length;
*/

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
 * Check if the hello world BPF program has been deployed
 */
export async function checkProgram(stock_seed: string): Promise<void> {
  // Read program id from keypair file
  try {
    const programKeypair = await createKeypairFromFile(PROGRAM_KEYPAIR_PATH);
    programId = programKeypair.publicKey;
  } catch (err) {
    const errMsg = (err as Error).message;
    throw new Error(
      `Failed to read program keypair at '${PROGRAM_KEYPAIR_PATH}' due to error: ${errMsg}. Program may need to be deployed with \`solana program deploy dist/program/helloworld.so\``,
    );
  }

  // Check if the program has been deployed
  const programInfo = await connection.getAccountInfo(programId);
  if (programInfo === null) {
    if (fs.existsSync(PROGRAM_SO_PATH)) {
      throw new Error(
        'Program needs to be deployed with `solana program deploy dist/program/helloworld.so`',
      );
    } else {
      throw new Error('Program needs to be built and deployed');
    }
  } else if (!programInfo.executable) {
    throw new Error(`Program is not executable`);
  }
  console.log(`Using program ${programId.toBase58()}`);

  // Derive the address (public key) of a greeting account from the program so that it's easy to find later.
  const greetedPubkey = await PublicKey.createWithSeed(
    payer.publicKey,
    stock_seed,
    programId,
  );
  mapStockPDA = mapStockPDA.set(stock_seed, greetedPubkey);

  // Check if the greeting account has already been created
  const greetedAccount = await connection.getAccountInfo(greetedPubkey);

  if (greetedAccount === null) {
        console.log( 'Creating account ', greetedPubkey.toBase58(), ' for stock', stock_seed);
        const lamports = await connection.getMinimumBalanceForRentExemption( MESSAGING_SIZE,);

        console.log( 'MESSAGING_SIZE: ' + MESSAGING_SIZE);

        const transaction = new Transaction().add(
            SystemProgram.createAccountWithSeed({
                fromPubkey: payer.publicKey,
                basePubkey: payer.publicKey,
                seed: stock_seed,
                newAccountPubkey: greetedPubkey,
                lamports,
                space: MESSAGING_SIZE,
                programId,
            }),
        );
        await sendAndConfirmTransaction(connection, transaction, [payer]);
  }
}

/**
 * Say hello
 */
export async function sayHello(greetedPubkey: PublicKey, inst: number, price: number, quantity: number, retailer: string, stock: string): Promise<void> {

  console.log('Saying hello to', greetedPubkey.toBase58());

    let payload = undefined;

    if ( inst === 0) {
        payload = new ClientPairPayload({
            variant: ClientPairInstruction.ClientOne,
            price: price,
            quantity: quantity,
            retailer: retailer,
            stock: stock
        });
  }  else if ( inst === 1) { 
        payload = new ClientPairPayload({
            variant: ClientPairInstruction.ClientTwo,
            price: price,
            quantity: quantity,
            retailer: retailer,
            stock: stock
        });
  }  else if ( inst === 2) { 
        payload = new ClientPairPayload({
            variant: ClientPairInstruction.ClientThree,
            price: price,
            quantity: quantity,
            retailer: retailer,
            stock: stock
        });
  }  else if ( inst === 3) { 
        payload = new ClientPairPayload({
            variant: ClientPairInstruction.InitializeAccount,
            price: price,
            quantity: quantity,
            retailer: retailer,
            stock: stock
        });
  }  else if ( inst === 4) { 
        payload = new ClientPairPayload({
            variant: ClientPairInstruction.FindRetailer,
            price: price,
            quantity: quantity,
            retailer: retailer,
            stock: stock
        });
 }

    console.log( {payload});
    console.log( "Calling Transaction");
  // Serialize the payload
  const payloadBuff = Buffer.from(serialize(payloadSchema, payload));

  const instruction = new TransactionInstruction({
    keys: [{pubkey: greetedPubkey, isSigner: false, isWritable: true}],
    programId,
    data: payloadBuff,
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [payer],
  );
}

export async function InitUserPortfolio(
        greetedPubkey: PublicKey, 
        inst: number, 
        username: string, 
        fullname: string,
        email: string,
        phone: string,
        address: string,
        fsop: number,
        stock: string,
): Promise<void> {

    let payloadBuff = undefined;

    if ( inst === 6) {
        let user_payload = new InitUserPayload({
            variant: ClientPairInstruction.InitUserPortfolio,
            username: username,
            fullname: fullname,
            email: email,
            phone: phone,
            address: address,
        });
        payloadBuff = Buffer.from(serialize(InitUserSchema, user_payload));
    } else if ( inst === 7) {
        let user_payload = new UpdateUserPayload({
            variant: ClientPairInstruction.UpdateUserPortfolio,
            username: username,
            fsop: fsop,
            stock: stock,
        });
        payloadBuff = Buffer.from(serialize(UpdateUserSchema, user_payload));
    }

    const instruction = new TransactionInstruction({
        keys: [{pubkey: greetedPubkey, isSigner: false, isWritable: true}],
        programId,
        data: payloadBuff,
    });
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(instruction),
        [payer],
    );
}



/**
 * Report the number of times the greeted account has been said hello to
 */
export async function getStockQuote(stock_seed: string): Promise<void> {

    console.log( "getStockQuote for seed: " + stock_seed);

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

export async function getBTreeMap(stock_seed: string): Promise<void> {

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

    const btree = Buffer.from(accountInfo.data);
    console.log({btree});
    if ( btree[0] === 0)
    {
        console.log('BTree Not Initialized');
        return;
    }

    const btreeLen = btree.readInt32LE(1) - 5;
    console.log('btreeLen: ' + btreeLen);

    const btreeCount = btree.readInt32LE(5);
    console.log('btreeCount: ' + btreeCount);

    const btreePacket = btree.slice(9, 9+btreeLen);

    console.log( {btreePacket});

    let i = 0;
    while( i < btreeLen)
    {
        // First get the index (String)
        {
            const indexLen = btreePacket.readInt32LE(i); console.log( 'indexLen: ' + indexLen);
            const indexB = btreePacket.slice(i+4, i+4+indexLen); console.log( {indexB}); console.log( String(indexB));
            i+= (4+indexLen);
            console.log( 'i = ' + i);
        }
        /*
        {
            const indexLen = btreePacket.readInt32LE(i); console.log( 'indexLen: ' + indexLen);
            const indexB = btreePacket.slice(i+4, i+4+indexLen); console.log( String(indexB));
            i+= (4+indexLen);
            console.log( 'i = ' + i);
        }
        */
        const price = btreePacket.readInt32LE(i); console.log( 'price: ' + price);
        i+=4;
            console.log( 'i = ' + i);
        const quantity = btreePacket.readInt32LE(i); console.log( 'quantity: ' + quantity);
        i+=4;
            console.log( 'i = ' + i);
        {
            const indexLen = btreePacket.readInt32LE(i); console.log( 'indexLen: ' + indexLen);
            const indexB = btreePacket.slice(i+4, i+4+indexLen); console.log( String(indexB));
            i+= (4+indexLen);
            console.log( 'i = ' + i);
        }
        {
            const indexLen = btreePacket.readInt32LE(i); console.log( 'indexLen: ' + indexLen);
            const indexB = btreePacket.slice(i+4, i+4+indexLen); console.log( String(indexB));
            i+= (4+indexLen);
            console.log( 'i = ' + i);
        }
        console.log( "-------------------------------------------");
        
        // const index = borsh.deserialize('string', indexB);
        // console.log( 'index: ' + index);
    }

}

export let quotes = [{
  name: 'Placeholder',
  marketType: 17,
  marketLabel: 'CC',
  stockCode: 'BTC',
  stockId: '12000015',
  marketCode: 360,
  instrumentType: 12,
  priceAccuracy: 2,
  isPlate: false,
  isFutures: false,
  isOption: false,
  subInstrumentType: 44,
  strikePrice: 'NaN',
  underlyingStock: {},
  time: 1709944531900,
  priceNominal: '67919.00',
  priceLastClose: '68285.00',
  serverSendToClientTimeMs: '1709944540014',
  exchangeDataTimeMs: '1709944531900',
  serverRecvFromExchangeTimeMs: '1709944532050',
  priceOpen: '68285.00',
  priceHighest: '68442.00',
  priceLowest: '67899.00',
  volume: '137.04',
  turnover: '9.34M',
  ratioVolume: '0.00',
  ratioTurnover: '0.70%',
  amplitudePrice: '0.80%',
  priceAverage: '68.15',
  changeSpeedPrice: '0',
  ratioBidAsk: '0.00%',
  volumePrecision: 3,
  statistics_24h: {
    priceHighest: '70184000000000',
    priceLowest: '66036000000000',
    volume: '9750027',
    turnover: '663795655785',
    priceChange: '1041000000000',
    ratioPriceChange: '1556'
  },
  priceBid: '0.00',
  priceAsk: '0.00',
  volumeBid: '0',
  volumeAsk: '0',
  orderVolumePrecision: 9,
  price: '67919.00',
  change: '-366.00',
  changeRatio: '-0.54%',
  priceDirect: 'down',
  priceMiddle: '0.000',
  delayTime: 0,
  before_open_stock_info: {
    exchange_time: null,
    price: '--',
    change: '--',
    changeRatio: '0.00%',
    priceDirect: 'flat'
  },
  sparkInfo: {}
}];

export async function fetchLiveQuotes() {

        console.log( new Date());

        let json_rsp = await fetch_watchlist();

        console.log(json_rsp["allCount"]);

        Object.keys(json_rsp["data"]["list"]).forEach((key, value)=> {

            quotes.push(json_rsp["data"]["list"][key]);
            console.log(
                json_rsp["data"]["list"][key]["stockId"] + ', ' +
                json_rsp["data"]["list"][key]["stockCode"] + ', ' +
                json_rsp["data"]["list"][key]["name"] + ', ' +
                Math.ceil(10000.0 * parseFloat(json_rsp["data"]["list"][key]["price"])) + ', (' +
                json_rsp["data"]["list"][key]["price"] + ') ' +
                json_rsp["data"]["list"][key]["priceLastClose"]
            );
            console.log( quotes.length);
            console.log( "------------------------------------------> " + quotes.length);
        });
}
