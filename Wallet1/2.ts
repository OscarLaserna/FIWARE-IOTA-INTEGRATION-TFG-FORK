import { Wallet, CoinType, TaggedDataPayload, PayloadType, Utils } from '@iota/sdk';
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

// Lee la ruta desde un archivo JSON
function loadRoute(routeFile: string): RoutePoint[] {
    const filePath = path.resolve(routeFile);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as RoutePoint[];
}

// Envía datos a IOTA
async function sendToIota(payload: string) {
    const wallet = new Wallet({
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

    const account = await wallet.getAccount(process.env.ACCOUNT_NAME!);
    await account.sync();

    const address = 'rms1qr69y65kxmcxy0dxjh6f8at8vqc270g37a9ku5ewkk72q5gwgt83x3lwj8j';
    // Crear un payload de datos etiquetados
    const taggedDataPayload: TaggedDataPayload = {
        type: PayloadType.TaggedData,
        tag: utf8ToHex('/ul/iot1234/device001/attrs'), // Usa la función personalizada aquí
        data: utf8ToHex(payload), // Y aquí también
        getType: () => PayloadType.TaggedData,
    };


    const response = await account.send(BigInt(1000000), address, { taggedDataPayload });
    console.log(`Block sent: ${process.env.EXPLORER_URL}/block/${response.blockId}`);
}

// Simula el camión
async function simulateTruck(routeFile: string) {
    const route = loadRoute(routeFile);
    let temperature = 20.0; // Temperatura inicial
    let acState = false; // Aire acondicionado apagado inicialmente

    for (const point of route) {
        // Alternar estado del aire acondicionado cada 10 puntos
        if (route.indexOf(point) % 10 === 0) {
            acState = !acState;
        }

        // Crear el payload
        const payload = `t|${temperature.toFixed(1)}|ac|${acState ? 'on' : 'off'}|gps|${point.lng},${point.lat}`;

        console.log(`Sending data: ${payload}`);
        await sendToIota(payload);

        // Actualizar temperatura
        temperature += Math.random() * 2 - 1; // Simula un cambio aleatorio
        temperature = Math.max(15, Math.min(temperature, 30)); // Límite entre 15 y 30 °C

        // Espera 1 segundo antes de enviar el siguiente punto
        await new Promise(resolve => setTimeout(resolve, 30000));
    }
}

// Ejecuta la simulación
const routeFile = './vehicle001-route.json'; // Ruta del archivo JSON
simulateTruck(routeFile).catch(err => console.error('Error:', err));
