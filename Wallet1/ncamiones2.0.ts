import { Wallet, CoinType, TaggedDataPayload, PayloadType } from '@iota/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
require('dotenv').config();

// Función para convertir una cadena UTF-8 a hexadecimal
function utf8ToHex(str: string): string {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}

let walletInstance1: Wallet | null = null;
let walletInstance3: Wallet | null = null;
let acStates: { [key: number]: boolean } = {}; // Estado del aire acondicionado por camión

// Inicializa la wallet 1 (Wallet1)
async function initializeWallet1(): Promise<Wallet> {
    if (!walletInstance1) {
        walletInstance1 = new Wallet({
            storagePath: process.env.WALLET_DB_PATH,
            clientOptions: {
                nodes: [process.env.NODE_URL as string],
            },
            coinType: CoinType.Shimmer,
            secretManager: {
                stronghold: {
                    snapshotPath: './wallet.stronghold',
                    password: process.env.SH_PASSWORD as string,
                },
            },
        });
    }
    return walletInstance1;
}

async function initializeWallet3(): Promise<Wallet> {
    if (!walletInstance3) {
        walletInstance3 = new Wallet({
            storagePath: './Wallet3-database', // Usa la carpeta Wallet3-database
            clientOptions: {
                nodes: [process.env.NODE_URL as string],
            },
            coinType: CoinType.Shimmer,
            secretManager: {
                stronghold: {
                    snapshotPath: './wallet3.stronghold', // Asegúrate de que esté usando el archivo correcto
                    password: process.env.SH_PASSWORD as string,
                },
            },
        });
    }
    return walletInstance3;
}

// Envía datos a IOTA usando la wallet 1
async function sendToIotaWallet1(payload: string) {
    const wallet = await initializeWallet1();
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
    console.log(`Block sent to Wallet1: ${process.env.EXPLORER_URL}/block/${response.blockId}`);
}

// Envía datos a IOTA usando la wallet 3
async function sendToIotaWallet3(payload: string) {
    const wallet = await initializeWallet3();
    const account = await wallet.getAccount('Wallet3');
    await account.sync();

    const address = 'rms1qqedg4l5g6sxr5k6zs96k6vm66arpgnl0zzx0e9n7j9frtwtmmwzsev0nw4';
    const taggedDataPayload: TaggedDataPayload = {
        type: PayloadType.TaggedData,
        tag: utf8ToHex('/ul/iot1234/device001/attrs'),
        data: utf8ToHex(payload),
        getType: () => PayloadType.TaggedData,
    };

    const response = await account.send(BigInt(50600), address, { taggedDataPayload });
    console.log(`Block sent to Wallet3: ${process.env.EXPLORER_URL}/block/${response.blockId}`);
}

// Simula el camión
async function simulateTruck(routeFile: string, truckId: number, walletChoice: number): Promise<void> {
    const route = loadRoute(routeFile);
    let temperature = 20.0;

    console.log(`Truck ${truckId} started simulation`);

    for (let i = 0; i < route.length; i++) {
        const point = route[i];

        // Verifica que las coordenadas existan
        if (!point || point.length < 2) {
            console.error(`Truck ${truckId}: Invalid GPS point:`, point);
            continue;
        }

        // Crear el payload con coordenadas
        const payload = `truck|${truckId}|t|${temperature.toFixed(1)}|ac|${acStates[truckId] ? 'on' : 'off'}|gps|${point[1]},${point[0]}`;
        console.log(`Truck ${truckId}: Sending data: ${payload}`);

        try {
            if (walletChoice === 1) {
                await sendToIotaWallet1(payload);
            } else if (walletChoice === 3) {
                await sendToIotaWallet3(payload);
            }
        } catch (error) {
            console.error(`Truck ${truckId}: Error sending to IOTA:`, error);
            break; // Detén el ciclo si hay un error
        }

        // Actualizar la temperatura
        if (acStates[truckId]) {
            temperature -= Math.random() * 0.5; // Si el aire está encendido, baja la temperatura
        } else {
            temperature += Math.random() * 0.5; // Si el aire está apagado, sube la temperatura
        }
        temperature = Math.max(15, Math.min(temperature, 30));

        // Esperar 1 segundo antes de enviar el siguiente punto
        await new Promise(resolve => setTimeout(resolve, 1000));
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

// Lanza múltiples camiones con un intervalo de 5 segundos
async function launchTrucks(routeFile: string, numTrucks: number, interval: number) {
    const truckPromises: Promise<void>[] = []; // Para almacenar las promesas de cada camión

    for (let i = 0; i < numTrucks; i++) {
        const walletChoice = i % 2 === 0 ? 1 : 3; // Asigna Wallet3 a los camiones impares y Wallet1 a los pares

        // Lanza cada camión después de un intervalo
        truckPromises.push(new Promise<void>(resolve => {
            setTimeout(() => {
                simulateTruck(routeFile, i + 1, walletChoice).then(() => {
                    console.log(`Truck ${i + 1} finished simulation`);
                    resolve();
                }).catch(err => {
                    console.error(`Error in Truck ${i + 1}:`, err);
                    resolve();
                });
            }, i * interval); // Multiplicamos el índice del camión por el intervalo (5 segundos)
        }));
    }

    // Esperar que todas las simulaciones se terminen
    await Promise.all(truckPromises);

    console.log('All trucks have finished the simulation');
    process.exit(0); // Finalizar el proceso después de que todos los camiones hayan terminado
}

// Ejecuta la simulación con un intervalo de 5 segundos
const routeFile = './vehicle001-route.json';
setupUserInput();
launchTrucks(routeFile, 2, 5000).catch(err => console.error('Error:', err)); // 2 camiones con 5 segundos de intervalo
