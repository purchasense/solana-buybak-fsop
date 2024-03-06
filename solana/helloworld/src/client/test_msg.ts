
import { serialize, deserialize, deserializeUnchecked } from "borsh";
import { Buffer } from "buffer";
import fs from 'mz/fs';
import path from 'path';
import * as borsh from 'borsh';
const sizeof = require('object-sizeof')

import {getPayer, getRpcUrl, createKeypairFromFile} from './utils';

import BN = require("bn.js");

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
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);
