// worker.js

import { parentPort, workerData } from 'worker_threads';
import { Wallet, CoinType, TaggedDataPayload, PayloadType } from '@iota/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
require('dotenv').config();

const { truckId, routeFile, walletChoice } = workerData;
let acState = false; // Estado inicial del aire acondicionado
let temperature = 20.0;

function utf8ToHex(str: string): string {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}

async function initializeWallet(walletNumber: number): Promise<Wallet> {
    return new Wallet({
        storagePath: walletNumber === 1 ? process.env.WALLET_DB_PATH : './Wallet3-database',
        clientOptions: { nodes: [process.env.NODE_URL as string] },
        coinType: CoinType.Shimmer,
        secretManager: {
            stronghold: {
                snapshotPath: walletNumber === 1 ? './wallet.stronghold' : './wallet3.stronghold',
                password: process.env.SH_PASSWORD as string,
            },
        },
    });
}

async function sendToIota(wallet: Wallet, payload: string) {
    const account = await wallet.getAccount(walletChoice === 1 ? process.env.ACCOUNT_NAME! : 'Wallet3');
    await account.sync();

    const address = walletChoice === 1
        ? 'rms1qpun0fuekhvjvyhesrnehuvuxq6p2rlwapflg073vtx450ntderdjqjr74w'
        : 'rms1qqedg4l5g6sxr5k6zs96k6vm66arpgnl0zzx0e9n7j9frtwtmmwzsev0nw4';

    const taggedDataPayload: TaggedDataPayload = {
        type: PayloadType.TaggedData,
        tag: utf8ToHex('/ul/iot1234/device001/attrs'),
        data: utf8ToHex(payload),
        getType: () => PayloadType.TaggedData,
    };

    const response = await account.send(BigInt(50600), address, { taggedDataPayload });
    parentPort?.postMessage(`✔️ Data sent successfully: ${process.env.EXPLORER_URL}/block/${response.blockId}`);
}

function loadRoute(routeFile: string): number[][] {
    const filePath = path.resolve(routeFile);
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        parentPort?.postMessage(`❌ Error loading route file: ${error}`);
        return [];
    }
}

const route = loadRoute(routeFile);

let wallet: Wallet;

(async () => {
    wallet = await initializeWallet(walletChoice);

    for (let i = 0; i < route.length; i++) {
        const point = route[i];

        if (!point || point.length < 2) {
            parentPort?.postMessage(`⚠️ Invalid GPS point: ${point}`);
            continue;
        }

        const payload = `truck|${truckId}|t|${temperature.toFixed(1)}|ac|${acState ? 'on' : 'off'}|gps|${point[1]},${point[0]}`;
        parentPort?.postMessage(`🚛 Truck ${truckId}: 📡 Sending: ${payload}`);

        try {
            await sendToIota(wallet, payload);
        } catch (error) {
            parentPort?.postMessage(`❌ Error sending to IOTA: ${error}`);
        }

        temperature += acState ? -Math.random() * 0.5 : Math.random() * 0.5;
        temperature = Math.max(15, Math.min(temperature, 30));

        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    parentPort?.postMessage(`✅ Finished simulation`);
})();

parentPort?.on('message', (message) => {
    if (message.acState !== undefined) {
        acState = message.acState; // Actualizar el estado del aire acondicionado
    }
});
