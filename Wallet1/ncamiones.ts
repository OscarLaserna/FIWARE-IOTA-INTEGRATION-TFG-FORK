import { Wallet, CoinType, TaggedDataPayload, PayloadType } from '@iota/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
require('dotenv').config({ path: './4.env' });

// Función para convertir una cadena UTF-8 a hexadecimal
function utf8ToHex(str: string): string {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}

let walletInstance: Wallet | null = null;
let acStates: { [key: number]: boolean } = {}; // Estado del aire acondicionado por camión

// Inicializar la wallet una sola vez
async function initializeWallet(): Promise<Wallet> {
    if (!walletInstance) {
        walletInstance = new Wallet({
            storagePath: process.env.WALLET_DB_PATH,
            clientOptions: {
                nodes: [process.env.NODE_URL as string],
            },
            coinType: 4219, // 🔥 Cambiado a IOTA Testnet
            secretManager: {
                stronghold: {
                    snapshotPath: './wallet4.stronghold', // 🔥 Cambiado a wallet4.stronghold
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

    // 🔥 Cambiar la dirección de destino
    const address = 'tst1qzxynkw7zxesjr2x50mre25dtva03tpgrwwtnfrmqcakwft7pd09jlj979x';

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
async function simulateTruck(routeFile: string, truckId: number): Promise<void> {
    const route = loadRoute(routeFile);
    let temperature = 20.0;

    console.log(`Truck ${truckId} started simulation`);

    for (let i = 0; i < route.length; i++) {
        const point = route[i];

        if (!point || point.length < 2) {
            console.error(`Truck ${truckId}: Invalid GPS point:`, point);
            continue;
        }

        const payload = `truck|${truckId}|t|${temperature.toFixed(1)}|ac|${acStates[truckId] ? 'on' : 'off'}|gps|${point[1]},${point[0]}`;
        console.log(`Truck ${truckId}: Sending data: ${payload}`);

        try {
            await sendToIota(payload);
        } catch (error) {
            console.error(`Truck ${truckId}: Error sending to IOTA:`, error);
            break;
        }

        if (acStates[truckId]) {
            temperature -= Math.random() * 0.5;
        } else {
            temperature += Math.random() * 0.5;
        }
        temperature = Math.max(15, Math.min(temperature, 30));
    }

    console.log(`Truck ${truckId} finished simulation`);
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

    console.log('Commands: TRUCK_ID ON (turn AC on), TRUCK_ID OFF (turn AC off), EXIT (stop simulation)');
    rl.on('line', (input) => {
        const [truckIdStr, command] = input.trim().split(' ');
        const truckId = parseInt(truckIdStr, 10);

        if (isNaN(truckId)) {
            console.log('Invalid truck ID. Use the format: TRUCK_ID ON/OFF');
            return;
        }

        if (command?.toUpperCase() === 'ON') {
            acStates[truckId] = true;
            console.log(`Truck ${truckId}: AC turned ON`);
        } else if (command?.toUpperCase() === 'OFF') {
            acStates[truckId] = false;
            console.log(`Truck ${truckId}: AC turned OFF`);
        } else if (command?.toUpperCase() === 'EXIT') {
            console.log('Exiting simulation...');
            rl.close();
            process.exit(0);
        } else {
            console.log('Invalid command. Use "TRUCK_ID ON", "TRUCK_ID OFF", or "EXIT".');
        }
    });
}

// Lanza múltiples camiones con un intervalo
async function launchTrucks(routeFile: string, numTrucks: number, duration: number) {
    const truckPromises: Promise<void>[] = [];

    for (let i = 0; i < numTrucks; i++) {
        truckPromises.push(simulateTruck(routeFile, i + 1));
    }

    await Promise.all(truckPromises);

    console.log('All trucks have finished the simulation');
    process.exit(0);
}

// Ejecuta la simulación
const routeFile = './vehicle001-route.json';
setupUserInput();
launchTrucks(routeFile, 1, 3).catch(err => console.error('Error:', err));
