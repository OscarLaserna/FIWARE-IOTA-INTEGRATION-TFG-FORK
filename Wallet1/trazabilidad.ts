import { Wallet, CoinType, TaggedDataPayload, PayloadType } from '@iota/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
require('dotenv').config();

// Función para convertir una cadena UTF-8 a hexadecimal
function utf8ToHex(str: string): string {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}

let walletInstance: Wallet | null = null;
let acState = false; // Estado del aire acondicionado (ON/OFF)
let blockIds: string[] = []; // Array para almacenar los block IDs

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

    // Verifica si response.blockId está definido antes de agregarlo al array
    if (response.blockId) {
        blockIds.push(response.blockId);
    } else {
        console.error('Block ID is undefined');
    }
}

// Simula el camión
async function simulateTruck(routeFile: string) {
    const route = loadRoute(routeFile);
    let temperature = 20.0;

    for (let i = 0; i < route.length; i++) {
        const point = route[i];

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
        if (acState) {
            temperature -= Math.random() * 0.5; // Si el aire está encendido, baja la temperatura
        } else {
            temperature += Math.random() * 0.5; // Si el aire está apagado, sube la temperatura
        }
        temperature = Math.max(15, Math.min(temperature, 30));

        // Esperar 1 segundo antes de enviar el siguiente punto
        //await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Una vez que la simulación ha terminado, consulta los bloques
    await queryBlocks();
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

// Configura el sistema de entrada para cambiar el estado del AC
function setupUserInput() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log('Commands: ON (turn AC on), OFF (turn AC off), EXIT (stop simulation)');
    rl.on('line', (input) => {
        const command = input.trim().toUpperCase();
        if (command === 'ON') {
            acState = true;
            console.log('AC turned ON');
        } else if (command === 'OFF') {
            acState = false;
            console.log('AC turned OFF');
        } else if (command === 'EXIT') {
            console.log('Exiting simulation...');
            rl.close();
            process.exit(0);
        } else {
            console.log('Invalid command. Use ON, OFF, or EXIT.');
        }
    });
}

// Consulta los bloques enviados
async function queryBlocks() {
    const wallet = await initializeWallet();
    const client = wallet.getClient(); // El cliente ahora es un 'Client' que se obtiene de 'getClient'

    for (const blockId of blockIds) {
        try {
            // Intentamos obtener los datos del bloque, en lugar de 'getBlock', usa 'getBlockMetadata' o similar
            const blockMetadata = await client.getBlockMetadata(blockId); 
            console.log(`Block ID: ${blockId}`);
            console.log(`Block Data: ${JSON.stringify(blockMetadata)}`);
        } catch (error) {
            console.error(`Error retrieving block ${blockId}:`, error);
        }
    }
}


// Ejecuta la simulación
const routeFile = './vehicle001-route.json';
setupUserInput();
simulateTruck(routeFile).catch(err => console.error('Error:', err));
