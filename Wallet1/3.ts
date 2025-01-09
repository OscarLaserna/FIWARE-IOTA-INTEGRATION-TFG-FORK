import { Wallet, CoinType, TaggedDataPayload, PayloadType } from '@iota/sdk';
import * as fs from 'fs';
import * as path from 'path';
require('dotenv').config();

// Función para convertir una cadena UTF-8 a hexadecimal
function utf8ToHex(str: string): string {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}

interface RoutePoint {
    lat: number;
    lng: number;
}

let walletInstance: Wallet | null = null;

// Inicializar la wallet una sola vez
async function initializeWallet(): Promise<Wallet> {
    if (!walletInstance) {
        walletInstance = new Wallet({
            storagePath: process.env.WALLET_DB_PATH,
            clientOptions: {
                nodes: [process.env.NODE_URL as string],
            },
            coinType: CoinType.Shimmer,
            secretManager: {
                stronghold: {
                    snapshotPath: './v3.stronghold',
                    password: process.env.SH_PASSWORD as string,
                },
            },
        });
    }
    return walletInstance;
}

// Envía datos a IOTA
async function sendToIota(payload: string) {
    const wallet = await initializeWallet();
    const account = await wallet.getAccount(process.env.ACCOUNT_NAME!);
    await account.sync();

    const address = 'rms1qr69y65kxmcxy0dxjh6f8at8vqc270g37a9ku5ewkk72q5gwgt83x3lwj8j';
    const taggedDataPayload: TaggedDataPayload = {
        type: PayloadType.TaggedData,
        tag: utf8ToHex('/ul/iot1234/device001/attrs'),
        data: utf8ToHex(payload),
        getType: () => PayloadType.TaggedData,
    };

    const response = await account.send(BigInt(50600), address, { taggedDataPayload });
    console.log(`Block sent: ${process.env.EXPLORER_URL}/block/${response.blockId}`);
}

// Simula el camión
async function simulateTruck(routeFile: string) {
    const route = loadRoute(routeFile);
    let temperature = 20.0;
    let acState = false;

    for (const point of route) {
        if (route.indexOf(point) % 10 === 0) {
            acState = !acState;
        }

        const payload = `t|${temperature.toFixed(1)}|ac|${acState ? 'on' : 'off'}|gps|${point.lng},${point.lat}`;
        console.log(`Sending data: ${payload}`);
        await sendToIota(payload);

        temperature += Math.random() * 2 - 1;
        temperature = Math.max(15, Math.min(temperature, 30));

        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Lee la ruta desde un archivo JSON
function loadRoute(routeFile: string): RoutePoint[] {
    const filePath = path.resolve(routeFile);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as RoutePoint[];
}

// Ejecuta la simulación
const routeFile = './vehicle001-route.json';
simulateTruck(routeFile).catch(err => console.error('Error:', err));
