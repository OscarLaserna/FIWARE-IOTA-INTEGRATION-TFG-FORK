import { Wallet, CoinType, TaggedDataPayload, PayloadType } from '@iota/sdk';
import * as fs from 'fs';
import * as path from 'path';
require('dotenv').config();

// Función para convertir una cadena UTF-8 a hexadecimal
function utf8ToHex(str: string): string {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
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

    const address = 'rms1qpun0fuekhvjvyhesrnehuvuxq6p2rlwapflg073vtx450ntderdjqjr74w';
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

    for (let i = 0; i < route.length; i++) {
        const point = route[i];

        // Cambiar el estado del aire acondicionado cada 10 puntos
        if (i % 10 === 0) {
            acState = !acState;
        }

        // Verifica que las coordenadas existan
        if (!point || point.length < 2) {
            console.error('Invalid GPS point:', point);
            continue;
        }

        // Crear el payload con coordenadas
        const payload = `t|${temperature.toFixed(1)}|ac|${acState ? 'on' : 'off'}|gps|${point[1]},${point[0]}`;
        console.log(`Sending data: ${payload}`);

        try {
            await sendToIota(payload);
        } catch (error) {
            console.error('Error sending to IOTA:', error);
            break; // Detén el ciclo si hay un error
        }

        // Actualizar la temperatura
        temperature += Math.random() * 2 - 1;
        temperature = Math.max(15, Math.min(temperature, 30));

        // Esperar 1 segundo antes de enviar el siguiente punto
        //await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Lee la ruta desde un archivo JSON
function loadRoute(routeFile: string): number[][] {
    const filePath = path.resolve(routeFile);

    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading route file:', error);
        return [];
    }
}

// Ejecuta la simulación
const routeFile = './vehicle001-route.json';
simulateTruck(routeFile).catch(err => console.error('Error:', err));
