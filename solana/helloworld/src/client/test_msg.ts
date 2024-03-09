import axios from "axios";
import { serialize, deserialize, deserializeUnchecked } from "borsh";
import { Buffer } from "buffer";
import { fetch_watchlist } from "./fetch_watchlist";
import fs from 'mz/fs';
import path from 'path';
import * as borsh from 'borsh';
import * as I from 'immutable';

const sizeof = require('object-sizeof')

import {getPayer, getRpcUrl, createKeypairFromFile} from './utils';

import BN = require("bn.js");

const watchlistMooMoo = require("../../data/watchlist.json");

let quotes = [{
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

class MessagingAccount {
    price: number = 0;
    stock: String = "";
    constructor(fields: {price: number, stock: String} | undefined = undefined) {
        if (fields) {
            this.price = fields.price;
            this.stock = fields.stock;
        }
        else
        {
            this.price = 0;
            this.stock = "";
        }
    }
}

const MessagingSchema = new Map([
    [MessagingAccount,
        {
            kind: 'struct',
            fields: [
                ['price', 'u32'],
                ['stock', 'string'],
            ]
        }
    ],
]);


// const MESSAGING_SIZE = 56;

const MESSAGING_SIZE = borsh.serialize(
MessagingSchema,
new MessagingAccount(),
).length;

class BuybakPortfolio {
    index: String = "";
    price: number = 0;
    quantity: number = 0;
    retailer: String = "";
    stock: String = "";
    constructor(fields: {index: string, price: number, quantity: number, retailer: string, stock: String} | undefined = undefined) {
        if (fields) {
            this.index = fields.index;
            this.price = fields.price;
            this.quantity = fields.quantity;
            this.retailer = fields.retailer;
            this.stock = fields.stock;
        }
        else
        {
            this.index = "";
            this.price = 0;
            this.quantity = 0;
            this.retailer = "";
            this.stock = "";
        }
    }
}

const BuybakSchema = new Map([
    [BuybakPortfolio,
        {
            kind: 'struct',
            fields: [
                ['retailer', 'string'],
                ['price', 'u32'],
                ['quantity', 'u32'],
                ['retailer', 'string'],
                ['stock', 'string'],
            ]
        }
    ],
]);

class BuybakPortfolioVec {
    q: BuybakPortfolio[] = [];

    constructor(data?:BuybakPortfolioVec)
    {
        if ( data)
        {
            Object.assign(this, data);
        }
    }
}

const BuybakVecSchema = new Map([
    [BuybakPortfolioVec,
        {
            kind: 'struct',
            fields: [
                ['q', 'Vector'],
            ]
        }
    ],
]);




async function main() {

    const payload = new MessagingAccount({
        price: 32767,
        stock: "0123456789",
    });
    console.log({payload});

    console.log(MESSAGING_SIZE + ', ' + sizeof(payload) + ', ' + sizeof(payload.price) + ', ' + sizeof(payload.stock));

    // Serialize the payload
    const payloadBuffer = Buffer.from(serialize(MessagingSchema, payload));
    console.log( payloadBuffer);
    console.log( payloadBuffer.length);

    const messaging = borsh.deserialize(
        MessagingSchema,
        MessagingAccount,
        payloadBuffer
    );
    console.log({messaging});


    const buff = Buffer.from([
        0x19, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0f, 0x00, 0x00, 0x00, 0x11, 0x00, 0x00, 0x00, 
        0x6e, 0x69, 0x6b, 0x69, 0x74, 0x61, 0x20, 0x6e, 0x69, 0x6b, 0x6f, 0x6c, 0x61, 0x73, 0x68, 0x69, 
        0x6e, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
        0x00, 0x00, 0x00, 0x00,
    ]);

    /*
     * 1. read the firs t8 bytes. 
     * 2. Read the packet into new packet.
     * 3. deserialize
     */

    const packetLen = buff.readInt32LE(0);

    console.log('packetLen: ' + packetLen);

    let packet = buff.slice(8,8+packetLen);
    console.log( {packet});

    const msg = borsh.deserialize(
        MessagingSchema,
        MessagingAccount,
        packet
    );
    console.log( {msg});


    /*
    const validbuff = Buffer.from([0x1d, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x11, 0x00, 0x00, 0x00, 0x6e, 0x69, 0x6b, 0x69, 0x74, 0x61, 0x20, 0x6e, 0x69, 0x6b, 0x6f, 0x6c, 0x61, 0x73, 0x68, 0x69, 0x6e]);
    console.log( validbuff.length);

    const fb = Buffer.from([0xff, 0x7f, 0x00, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39]);
    const buffstruct = borsh.deserialize(
        MessagingSchema,
        MessagingAccount,
        fb
    );
    console.log( {buffstruct});

    const buff2 = Buffer.from([
        0x0f, 0x00, 0x00, 0x00,
        0x11, 0x00, 0x00, 0x00, 0x6e, 0x69, 0x6b, 0x69, 0x74, 0x61, 0x20, 0x6e, 0x69, 0x6b, 0x6f, 0x6c,
        0x61, 0x73, 0x68, 0x69, 0x6e
    ]);

    const buff2struct = borsh.deserialize(
        MessagingSchema,
        MessagingAccount,
        buff2
    );
    console.log( {buff2struct});
    */

    const btree = Buffer.from([
        0x01, 0x95, 0x01, 0x00, 0x00, 0x09, 0x00, 0x00, 0x00, 0x0c, 0x00, 0x00, 0x00, 0x41, 0x63, 0x65,
        0x20, 0x48, 0x61, 0x72, 0x64, 0x77, 0x61, 0x72, 0x65, 0xff, 0x7f, 0x00, 0x00, 0xff, 0xff, 0x00,
        0x00, 0x0c, 0x00, 0x00, 0x00, 0x41, 0x63, 0x65, 0x20, 0x48, 0x61, 0x72, 0x64, 0x77, 0x61, 0x72,
        0x65, 0x03, 0x00, 0x00, 0x00, 0x41, 0x43, 0x45, 0x0a, 0x00, 0x00, 0x00, 0x43, 0x56, 0x53, 0x20,
        0x48, 0x65, 0x61, 0x6c, 0x74, 0x68, 0xff, 0x7f, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00, 0x0a, 0x00,
        0x00, 0x00, 0x43, 0x56, 0x53, 0x20, 0x48, 0x65, 0x61, 0x6c, 0x74, 0x68, 0x03, 0x00, 0x00, 0x00,
        0x43, 0x53, 0x56, 0x08, 0x00, 0x00, 0x00, 0x43, 0x68, 0x69, 0x70, 0x6f, 0x74, 0x6c, 0x65, 0xff,
        0x7f, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x43, 0x68, 0x69, 0x70, 0x6f,
        0x74, 0x6c, 0x65, 0x03, 0x00, 0x00, 0x00, 0x43, 0x4d, 0x47, 0x0d, 0x00, 0x00, 0x00, 0x44, 0x75,
        0x6e, 0x6b, 0x69, 0x6e, 0x20, 0x44, 0x6f, 0x6e, 0x75, 0x74, 0x73, 0xff, 0x7f, 0x00, 0x00, 0xff,
        0xff, 0x00, 0x00, 0x0d, 0x00, 0x00, 0x00, 0x44, 0x75, 0x6e, 0x6b, 0x69, 0x6e, 0x20, 0x44, 0x6f,
        0x6e, 0x75, 0x74, 0x73, 0x02, 0x00, 0x00, 0x00, 0x44, 0x44, 0x09, 0x00, 0x00, 0x00, 0x48, 0x6f,
        0x6d, 0x65, 0x44, 0x65, 0x70, 0x6f, 0x74, 0xff, 0x7f, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00, 0x09,
        0x00, 0x00, 0x00, 0x48, 0x6f, 0x6d, 0x65, 0x44, 0x65, 0x70, 0x6f, 0x74, 0x02, 0x00, 0x00, 0x00,
        0x48, 0x44, 0x09, 0x00, 0x00, 0x00, 0x53, 0x74, 0x61, 0x72, 0x62, 0x75, 0x63, 0x6b, 0x73, 0xff,
        0x7f, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00, 0x09, 0x00, 0x00, 0x00, 0x53, 0x74, 0x61, 0x72, 0x62,
        0x75, 0x63, 0x6b, 0x73, 0x05, 0x00, 0x00, 0x00, 0x53, 0x42, 0x55, 0x4b, 0x53, 0x06, 0x00, 0x00,
        0x00, 0x54, 0x61, 0x72, 0x67, 0x65, 0x74, 0xff, 0x7f, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00, 0x06,
        0x00, 0x00, 0x00, 0x54, 0x61, 0x72, 0x67, 0x65, 0x74, 0x03, 0x00, 0x00, 0x00, 0x54, 0x47, 0x54,
        0x15, 0x00, 0x00, 0x00, 0x55, 0x6e, 0x69, 0x74, 0x65, 0x64, 0x20, 0x50, 0x61, 0x72, 0x63, 0x65,
        0x6c, 0x20, 0x53, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0xff, 0x7f, 0x00, 0x00, 0xff, 0xff, 0x00,
        0x00, 0x15, 0x00, 0x00, 0x00, 0x55, 0x6e, 0x69, 0x74, 0x65, 0x64, 0x20, 0x50, 0x61, 0x72, 0x63,
        0x65, 0x6c, 0x20, 0x53, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x03, 0x00, 0x00, 0x00, 0x55, 0x50,
        0x53, 0x09, 0x00, 0x00, 0x00, 0x57, 0x61, 0x6c, 0x67, 0x72, 0x65, 0x65, 0x6e, 0x73, 0xff, 0x7f,
        0x00, 0x00, 0xff, 0xff, 0x00, 0x00, 0x09, 0x00, 0x00, 0x00, 0x57, 0x61, 0x6c, 0x67, 0x72, 0x65,
        0x65, 0x6e, 0x73, 0x03, 0x00, 0x00, 0x00, 0x57, 0x4d, 0x47, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);

    /***********************

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
    ***********************/
        console.log( new Date());

        let json_rsp = await fetch_watchlist();

        console.log(json_rsp);

        /*
        Object.keys(json_rsp["data"]["list"]).forEach((key, value)=> {

            quotes.push(json_rsp["data"]["list"][key]);
            console.log(
                json_rsp["data"]["list"][key]["stockId"] + ', ' + 
                json_rsp["data"]["list"][key]["stockCode"] + ', ' + 
                json_rsp["data"]["list"][key]["name"] + ', ' + 
                Math.ceil(100000.0 * parseFloat(json_rsp["data"]["list"][key]["price"])) + ', (' + 
                json_rsp["data"]["list"][key]["price"] + ')'
            );
            console.log( quotes.length);
        });
        console.log( "-------------------------------------------");

        quotes.forEach((value, index) => {
            console.log( index + ', ' + value.name);
        });
        */
}

main().then(
    () => process.exit(),
    err => {
        process.exit(-1);
    },
);




