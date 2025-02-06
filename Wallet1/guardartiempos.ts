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
let acStates: { [key: number]: boolean } = {}; // Estado del aire acondicionado por camión

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

// Escribe en un archivo los datos de envío del camión
function getCurrentTimeInUTCPlusOne(): string {
    const now = new Date();
    const utcPlusOne = new Date(now.getTime() + 60 * 60 * 1000); // Sumar 1 hora
    return utcPlusOne.toISOString().replace('Z', '+01:00'); // Formatear como ISO8601
}

// Simula el camión y guarda el tiempo en un archivo
async function simulateTruck(routeFile: string, truckId: number): Promise<void> {
    const route = loadRoute(routeFile);
    let temperature = 20.0;

    console.log(`Truck ${truckId} started simulation`);

    const logFilePath = path.resolve(`truck_${truckId}_log.txt`); // Archivo de log para este camión

    fs.writeFileSync(logFilePath, '', 'utf-8');
    
    for (let i = 0; i < route.length; i++) {
        const point = route[i];

        // Verifica que las coordenadas existan
        if (!point || point.length < 2) {
            console.error(`Truck ${truckId}: Invalid GPS point:`, point);
            continue;
        }

        // Crear el payload con coordenadas
        const currentTime = getCurrentTimeInUTCPlusOne();
        const payload = `truck|${truckId}|t|${temperature.toFixed(1)}|ac|${acStates[truckId] ? 'on' : 'off'}|gps|${point[1]},${point[0]}|time|${currentTime}`;
        console.log(`Truck ${truckId}: Sending data: ${payload}`);

        try {
            await sendToIota(payload);

            // Guardar en el archivo de log
            const logEntry = `Truck ${truckId} - Time: ${currentTime}\n`;
            fs.appendFileSync(logFilePath, logEntry); // Escribir en el archivo
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

// Lanza múltiples camiones con un intervalo
async function launchTrucks(routeFile: string, numTrucks: number, duration: number) {
    const truckPromises: Promise<void>[] = []; // Para almacenar las promesas de cada camión

    for (let i = 0; i < numTrucks; i++) {
        truckPromises.push(simulateTruck(routeFile, i + 1));
    }

    // Esperar que todas las simulaciones se terminen
    await Promise.all(truckPromises);

    console.log('All trucks have finished the simulation');
    process.exit(0); // Finalizar el proceso después de que todos los camiones hayan terminado
}

// Ejecuta la simulación
const routeFile = './vehicle001-route.json';
setupUserInput();
launchTrucks(routeFile, 5, 3).catch(err => console.error('Error:', err));
