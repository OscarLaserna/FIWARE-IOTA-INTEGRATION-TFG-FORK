import { parentPort, workerData } from 'worker_threads';
import { Wallet, CoinType, TaggedDataPayload, PayloadType } from '@iota/sdk';
import * as fs from 'fs';
import * as path from 'path';

const { truckId, routeFile, walletChoice } = workerData;

// Seleccionar el archivo .env según walletChoice
require('dotenv').config({ path: walletChoice !== 1 ? `./${walletChoice}.env` : './.env' });

let acState = false; // Estado inicial del aire acondicionado
let temperature = 20.0;

// Mapeo de direcciones según walletChoice
const addresses: Record<number, string> = {
    1: 'rms1qpun0fuekhvjvyhesrnehuvuxq6p2rlwapflg073vtx450ntderdjqjr74w',
    2: 'rms1qqedg4l5g6sxr5k6zs96k6vm66arpgnl0zzx0e9n7j9frtwtmmwzsev0nw4',
    3: 'rms1qqphz3plmrx8p86kfvq00cs3rcn5p78edjh90hue0tcsae854esrjghl5nz'
};

const address = addresses[walletChoice] || addresses[1];

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
                snapshotPath: walletNumber === 1 ? './wallet.stronghold' : walletNumber === 2 ? './wallet2.stronghold' : './wallet3.stronghold',
                password: process.env.SH_PASSWORD as string,
            },
        },
    });
}

// Función para sobrescribir el archivo al iniciar
function initializeValidationFile(truckId: string) {
    const filePath = path.resolve(`./truck_${truckId}_validation_times.txt`);
    fs.writeFileSync(filePath, '', 'utf-8'); // Sobrescribe el archivo con contenido vacío
}

// Función para escribir el tiempo de validación de cada bloque
async function writeValidationTimeToFile(truckId: string, blockId: string, validationTime: number) {
    const filePath = path.resolve(`./truck_${truckId}_validation_times.txt`);
    const logMessage = `Block ID: ${blockId} | Validation Time: ${validationTime.toFixed(2)} seconds\n`;

    fs.appendFile(filePath, logMessage, (err) => {
        if (err) {
            parentPort?.postMessage(`❌ Error writing to file: ${err}`);
        } else {
            parentPort?.postMessage(`✔️ Validation time saved for truck ${truckId}`);
        }
    });
}

async function sendToIota(wallet: Wallet, payload: string) {
    const account = await wallet.getAccount(process.env.ACCOUNT_NAME!);
    await account.sync();

    const taggedDataPayload: TaggedDataPayload = {
        type: PayloadType.TaggedData,
        tag: utf8ToHex('/ul/iot1234/device001/attrs'),
        data: utf8ToHex(payload),
        getType: () => PayloadType.TaggedData,
    };

    const startTime = Date.now();
    const response = await account.send(BigInt(50600), address, { taggedDataPayload });
    parentPort?.postMessage(`✔️ Data sent successfully: ${process.env.EXPLORER_URL}/block/${response.blockId}`);

    const client = await wallet.getClient();
    let confirmed = false;

    while (!confirmed) {
        const blockMetadata = await client.getBlockMetadata(response.blockId!);
        if (blockMetadata?.blockId && blockMetadata?.referencedByMilestoneIndex) {
            confirmed = true;
        } else {
            await new Promise(resolve => setTimeout(resolve, 500)); // Espera 1 segundo antes de volver a consultar
        }
    }

    const endTime = Date.now();
    const validationTime = (endTime - startTime) / 1000; // En segundos
    parentPort?.postMessage(`Validation time: ${validationTime} seconds`);

    await writeValidationTimeToFile(truckId.toString(), response.blockId!, validationTime);
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
    // Sobrescribir el archivo antes de empezar
    initializeValidationFile(truckId.toString());

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

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    parentPort?.postMessage(`✅ Finished simulation`);
})();

parentPort?.on('message', (message) => {
    if (message.acState !== undefined) {
        acState = message.acState; // Actualizar el estado del aire acondicionado
    }
});
