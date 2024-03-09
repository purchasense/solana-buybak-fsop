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

        console.log( new Date());

        let json_rsp = await fetch_watchlist();

        console.log(json_rsp["allCount"]);

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
}

main().then(
    () => process.exit(),
    err => {
        process.exit(-1);
    },
);




