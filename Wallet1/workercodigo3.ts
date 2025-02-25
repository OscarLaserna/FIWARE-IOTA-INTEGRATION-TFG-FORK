// worker.js

import { parentPort, workerData } from 'worker_threads';
import { Wallet, CoinType, TaggedDataPayload, PayloadType } from '@iota/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';


// Seleccionar el archivo .env según el walletChoice
const { truckId, routeFile, walletChoice } = workerData;

// Seleccionar el archivo .env
if (walletChoice !=1)
require('dotenv').config({ path: `./${walletChoice}.env` });
// else 
// require('dotenv').config({ path: `./.env` });

let acState = false; // Estado inicial del aire acondicionado
let temperature = 20.0;

function utf8ToHex(str: string): string {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}

async function initializeWallet(walletNumber: number): Promise<Wallet> {
    return new Wallet({
        storagePath: process.env.WALLET_DB_PATH,
        clientOptions: { nodes: [process.env.NODE_URL as string] },
        coinType: CoinType.Shimmer,
        secretManager: {
            stronghold: {
                snapshotPath: walletNumber === 1 ? './wallet1.stronghold' : './wallet3.stronghold',
                password: process.env.SH_PASSWORD as string,
            },
        },
    });
}

async function sendToIota(wallet: Wallet, payload: string) {
    const account = await wallet.getAccount(process.env.ACCOUNT_NAME!);
    await account.sync();

    const address = walletChoice === 1
        ? 'smr1qpun0fuekhvjvyhesrnehuvuxq6p2rlwapflg073vtx450ntderdj54gywh'
        : 'smr1qrv2ercz8ep7e050pdun392448nnvlg3qamj6jlll525nvwwm9yl6usen5k';

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
