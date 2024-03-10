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
      `Failed to read program keypair at '${PROGRAM_KEYPAIR_PATH}' due to error: ${errMsg}. Program may need to be deployed with \`solana program deploy dist/program/solana_buybak_fsop.so\``,
    );
  }

  // Check if the program has been deployed
  const programInfo = await connection.getAccountInfo(programId);
  if (programInfo === null) {
    if (fs.existsSync(PROGRAM_SO_PATH)) {
      throw new Error(
        'Program needs to be deployed with `solana program deploy dist/program/solana_buybak_fsop.so`',
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

export async function FetchUserPortfolios(greetedPubkey: PublicKey): Promise<void> {

    const accountInfo = await connection.getAccountInfo(greetedPubkey);
    if (accountInfo === null) {
        throw 'Error: cannot find the greeted account';
    }
    console.log( 'FetchUserPortfolios from account: ' + greetedPubkey.toBase58());

/*
0000:   01 a7 01 00  00 04 00 00  00 06 00 00  00 6e 69 6b   .............nik
0010:   69 74 61 06  00 00 00 6e  69 6b 69 74  61 11 00 00   ita....nikita...
0020:   00 4e 69 6b  69 74 61 20  4e 69 6b 6f  6c 61 73 68   .Nikita Nikolash
0030:   69 6e 11 00  00 00 6e 69  6b 69 74 61  40 62 75 79   in....nikita@buy
0040:   62 61 6b 2e  78 79 7a 0c  00 00 00 37  37 33 32 34   bak.xyz....77324
0050:   32 31 31 32  32 33 33 1e  00 00 00 31  20 69 6e 66   2112233....1 inf
0060:   69 6e 69 74  65 20 6c 6f  6f 70 2c 20  4b 79 69 76   inite loop, Kyiv
0070:   2c 20 55 6b  72 61 69 6e  65 04 00 00  00 70 65 74   , Ukraine....pet
0080:   65 04 00 00  00 70 65 74  65 0a 00 00  00 50 65 74   e....pete....Pet
0090:   65 72 20 48  75 66 66 10  00 00 00 70  65 74 65 72   er Huff....peter
00a0:   40 62 75 79  62 61 6b 2e  78 79 7a 0a  00 00 00 33   @buybak.xyz....3
00b0:   31 32 33 32  34 35 35 34  34 1a 00 00  00 32 31 20   123245544....21
00c0:   6a 75 6d 70  20 73 74 72  65 65 74 2c  20 44 61 6c   jump street, Dal
00d0:   6c 61 73 2c  20 54 78 06  00 00 00 73  61 6d 65 65   las, Tx....samee
00e0:   72 06 00 00  00 73 61 6d  65 65 72 0f  00 00 00 53   r....sameer....S
00f0:   61 6d 65 65  72 20 4b 75  6c 6b 61 72  6e 69 11 00   ameer Kulkarni..
0100:   00 00 73 61  6d 65 65 72  40 62 75 79  62 61 6b 2e   ..sameer@buybak.
0110:   78 79 7a 0a  00 00 00 36  33 30 36 39  36 37 36 36   xyz....630696766
0120:   30 1f 00 00  00 31 20 69  6e 66 69 6e  69 74 65 20   0....1 infinite
0130:   6c 6f 6f 70  2c 20 4e 61  70 65 72 76  69 6c 6c 65   loop, Naperville
0140:   2c 20 49 4c  05 00 00 00  73 74 65 76  65 05 00 00   , IL....steve...
0150:   00 73 74 65  76 65 0b 00  00 00 53 74  65 76 65 20   .steve....Steve
0160:   4c 75 6b 65  73 10 00 00  00 73 74 65  76 65 40 62   Lukes....steve@b
0170:   75 79 62 61  6b 2e 78 79  7a 0a 00 00  00 34 30 38   uybak.xyz....408
0180:   38 33 34 31  32 33 32 21  00 00 00 31  31 57 32 33   8341232!...11W23
0190:   20 4d 65 6e  64 65 6c 69  6e 20 72 6f  61 64 2c 20    Mendelin road,
01a0:   50 61 73 61  64 65 6e 61  2c 20 43 41  00 00 00 00   Pasadena, CA....
*/

    const btree = Buffer.from(accountInfo.data);
    // console.log({btree});
    if ( btree[0] === 0)
    {
        // console.log('BTree Not Initialized');
        return;
    }

    const btreeLen = btree.readInt32LE(1) - 5;
    // console.log('btreeLen: ' + btreeLen);

    const btreeCount = btree.readInt32LE(5);
    console.log('btreeCount: ' + btreeCount);

    const btreePacket = btree.slice(9, 9+btreeLen);

    // console.log( {btreePacket});

    let i = 0;

    let payload = {
        index: "",
        username: "",
        fullname: "",
        email: "",
        phone: "",
        address: "",
    };

    while( i < btreeLen)
    {
        // First get the index (String)
        {
            const indexLen = btreePacket.readInt32LE(i); // console.log( 'indexLen: ' + indexLen);
            const indexB = btreePacket.slice(i+4, i+4+indexLen); // console.log( {indexB}); // console.log( String(indexB));
            i+= (4+indexLen);
            // console.log( 'i = ' + i);
            payload.index = String(indexB);
        }
        // First get the index (String)
        {
            const indexLen = btreePacket.readInt32LE(i); // console.log( 'indexLen: ' + indexLen);
            const indexB = btreePacket.slice(i+4, i+4+indexLen); // console.log( {indexB}); // console.log( String(indexB));
            i+= (4+indexLen);
            // console.log( 'i = ' + i);
            payload.username = String(indexB);
        }
        // First get the index (String)
        {
            const indexLen = btreePacket.readInt32LE(i); // console.log( 'indexLen: ' + indexLen);
            const indexB = btreePacket.slice(i+4, i+4+indexLen); // console.log( {indexB}); // console.log( String(indexB));
            i+= (4+indexLen);
            // console.log( 'i = ' + i);
            payload.fullname = String(indexB);
        }
        // First get the index (String)
        {
            const indexLen = btreePacket.readInt32LE(i); // console.log( 'indexLen: ' + indexLen);
            const indexB = btreePacket.slice(i+4, i+4+indexLen); // console.log( {indexB}); // console.log( String(indexB));
            i+= (4+indexLen);
            // console.log( 'i = ' + i);
            payload.email = String(indexB);
        }
        // First get the index (String)
        {
            const indexLen = btreePacket.readInt32LE(i); // console.log( 'indexLen: ' + indexLen);
            const indexB = btreePacket.slice(i+4, i+4+indexLen); // console.log( {indexB}); // console.log( String(indexB));
            i+= (4+indexLen);
            // console.log( 'i = ' + i);
            payload.phone = String(indexB);
        }
        // First get the index (String)
        {
            const indexLen = btreePacket.readInt32LE(i); // console.log( 'indexLen: ' + indexLen);
            const indexB = btreePacket.slice(i+4, i+4+indexLen); // console.log( {indexB}); // console.log( String(indexB));
            i+= (4+indexLen);
            // console.log( 'i = ' + i);
            payload.address = String(indexB);
        }
        console.log( payload);
        console.log( "-------------------------------------------");
        
        // const index = borsh.deserialize('string', indexB);
        // console.log( 'index: ' + index);
    }

}

export async function FetchFSOPPortfolioForUser(greetedPubkey: PublicKey): Promise<void> {
    const accountInfo = await connection.getAccountInfo(greetedPubkey);
    if (accountInfo === null) {
        throw 'Error: cannot find the greeted account';
    }
    console.log('');
    console.log( 'FetchFSOPPortfolioForUser from account: ' + greetedPubkey.toBase58());

/*
Public Key: 5E9NXSVERAmhqpKs3uDahjhYUEtSskyf56uPVghKj8xT
Balance: 0.00801792 SOL
Owner: 5pEQEkEFwwYAZFpBCrjkp1mwPBy1RarUT8waw9LwQL8p
Executable: false
Rent Epoch: 0
Length: 1024 (0x400) bytes
0000:   01 1a 01 00  00 09 00 00  00 05 00 00  00 41 41 50   .............AAP
0010:   4c 2c 06 00  00 00 73 61  6d 65 65 72  21 05 00 00   L,....sameer!...
0020:   05 00 00 00  41 41 50 4c  2c 04 00 00  00 43 4d 47   ....AAPL,....CMG
0030:   2c 06 00 00  00 73 61 6d  65 65 72 40  08 00 00 04   ,....sameer@....
0040:   00 00 00 43  4d 47 2c 05  00 00 00 43  4f 53 54 2c   ...CMG,....COST,
0050:   06 00 00 00  73 61 6d 65  65 72 af 00  00 00 05 00   ....sameer......
0060:   00 00 43 4f  53 54 2c 05  00 00 00 46  55 54 55 2c   ..COST,....FUTU,
0070:   06 00 00 00  73 61 6d 65  65 72 77 04  00 00 05 00   ....sameerw.....
0080:   00 00 46 55  54 55 2c 03  00 00 00 48  44 2c 06 00   ..FUTU,....HD,..
0090:   00 00 73 61  6d 65 65 72  4c 01 00 00  03 00 00 00   ..sameerL.......
00a0:   48 44 2c 04  00 00 00 4c  4c 59 2c 06  00 00 00 73   HD,....LLY,....s
00b0:   61 6d 65 65  72 f7 03 00  00 04 00 00  00 4c 4c 59   ameer........LLY
00c0:   2c 05 00 00  00 53 42 55  58 2c 06 00  00 00 73 61   ,....SBUX,....sa
00d0:   6d 65 65 72  2d 00 00 00  05 00 00 00  53 42 55 58   meer-.......SBUX
00e0:   2c 05 00 00  00 54 53 4c  41 2c 06 00  00 00 73 61   ,....TSLA,....sa
00f0:   6d 65 65 72  34 08 00 00  05 00 00 00  54 53 4c 41   meer4.......TSLA
0100:   2c 04 00 00  00 58 4f 4d  2c 06 00 00  00 73 61 6d   ,....XOM,....sam
0110:   65 65 72 4b  00 00 00 04  00 00 00 58  4f 4d 2c 00   eerK.......XOM,.
0120:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
0130:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
 */

    const btree = Buffer.from(accountInfo.data);
    // console.log({btree});
    if ( btree[0] === 0)
    {
        console.log('BTree Not Initialized');
        return;
    }

    const btreeLen = btree.readInt32LE(1) - 5;
    // console.log('btreeLen: ' + btreeLen);

    const btreeCount = btree.readInt32LE(5);
    console.log('btreeCount: ' + btreeCount);

    const btreePacket = btree.slice(9, 9+btreeLen);

    // console.log( {btreePacket});

    let i = 0;

    let payload = {
        index: "",
        username: "",
        fsop: 0,
        stock: "",
    };

    while( i < btreeLen)
    {
        // First get the index (String)
        {
            const indexLen = btreePacket.readInt32LE(i); // console.log( 'indexLen: ' + indexLen);
            const indexB = btreePacket.slice(i+4, i+4+indexLen); // console.log( {indexB}); // console.log( String(indexB));
            i+= (4+indexLen);
            // console.log( 'i = ' + i);
            payload.index = String(indexB);
        }
        // First get the index (String)
        {
            const indexLen = btreePacket.readInt32LE(i); // console.log( 'indexLen: ' + indexLen);
            const indexB = btreePacket.slice(i+4, i+4+indexLen); // console.log( {indexB}); // console.log( String(indexB));
            i+= (4+indexLen);
            // console.log( 'i = ' + i);
            payload.username = String(indexB);
        }
        {
            const fsop = btreePacket.readInt32LE(i); // console.log( 'price: ' + fsop);
            i+=4;
            payload.fsop = fsop;
        }
        // First get the index (String)
        {
            const indexLen = btreePacket.readInt32LE(i); // console.log( 'indexLen: ' + indexLen);
            const indexB = btreePacket.slice(i+4, i+4+indexLen); // console.log( {indexB}); // console.log( String(indexB));
            i+= (4+indexLen);
            // console.log( 'i = ' + i);
            payload.stock = String(indexB);
        }
        console.log( payload);
        console.log( "-------------------------------------------");
    }

}

