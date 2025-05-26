import { parentPort, workerData } from 'worker_threads';
import { Wallet, TaggedDataPayload, PayloadType } from '@iota/sdk';
import * as fs from 'fs';
import * as path from 'path';

const { truckId, routeFile, walletChoice } = workerData;

if (walletChoice !== 1) {
    require('dotenv').config({ path: `./${walletChoice}.env` });
}

let acState = false;
let temperature = 20.0;

// Archivo para guardar los bloques enviados
const blocksFilePath = path.resolve(`./camion${truckId}_bloques.txt`);

function utf8ToHex(str: string): string {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}

async function initializeWallet(walletNumber: number): Promise<Wallet> {
    return new Wallet({
        storagePath: process.env.WALLET_DB_PATH,
        clientOptions: { nodes: [process.env.NODE_URL as string] },
        coinType: 4219,
        secretManager: {
            stronghold: {
                snapshotPath: `./wallet${walletNumber}.stronghold`,
                password: process.env.SH_PASSWORD as string,
            },
        },
    });
}

async function sendToIota(wallet: Wallet, payload: string): Promise<string> {
    const account = await wallet.getAccount(process.env.ACCOUNT_NAME!);
    await account.sync();

    const address = "tst1qq5cme5jcmxurlvl6p4hy5z4mqx7c4tnakk7jfcm938nepapzq0vs5vwjyd"//process.env.WALLET_ADDRESS!;
    const taggedDataPayload: TaggedDataPayload = {
        type: PayloadType.TaggedData,
        tag: utf8ToHex('/ul/iot1234/truck5/attrs'),
        data: utf8ToHex(payload),
        getType: () => PayloadType.TaggedData,
    };

    const response = await account.send(BigInt(50600), address, { taggedDataPayload });

    if (!response.blockId) {
        throw new Error('Block ID is undefined');
    }

    return response.blockId;
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

        const payload = `t|${temperature.toFixed(1)}|ac|${acState ? 'on' : 'off'}|gps|${point[1]},${point[0]}`;
        parentPort?.postMessage(`🚛 Truck ${truckId}: 📡 Sending: ${payload}`);

        try {
            const blockId = await sendToIota(wallet, payload);
            const sendTime = new Date().toISOString(); // Hora de envío en formato ISO

            // Guardar el ID del bloque y la hora de envío en el archivo
            fs.appendFileSync(blocksFilePath, `${blockId},${sendTime}\n`, 'utf8');
            parentPort?.postMessage({ type: 'block_sent', blockId, sendTime });
        } catch (error) {
            parentPort?.postMessage(`❌ Error sending to IOTA: ${error}`);
        }

        temperature += acState ? -Math.random() * 0.5 : Math.random() * 0.5;
        temperature = Math.max(15, Math.min(temperature, 30));

        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    parentPort?.postMessage(`✅ Finished simulation`);

    // Cerrar la wallet y finalizar el worker
    await wallet.destroy();
    process.exit(0); // Finalizar el worker correctamente
})();

parentPort?.on('message', (message) => {
    if (message.acState !== undefined) {
        acState = message.acState;
    }
});