import { Wallet, CoinType, TaggedDataPayload, PayloadType, TransactionPayload, Block, TransactionEssence  } from '@iota/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
require('dotenv').config();

// Función para convertir una cadena UTF-8 a hexadecimal
function utf8ToHex(str: string): string {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}

// Función para convertir de hexadecimal a UTF-8
function hexToUtf8(hex: string): string {
    return Buffer.from(hex.substring(2), 'hex').toString('utf-8');
}

// Variables globales
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

// Envía datos a la red IOTA
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
    console.log(`Bloque enviado: ${process.env.EXPLORER_URL}/block/${response.blockId}`);
    if (response.blockId) {
        blockIds.push(response.blockId);
    } else {
        console.error('El Block ID es indefinido.');
    }
}

// Simula el movimiento del camión
async function simulateTruck(routeFile: string) {
    const route = loadRoute(routeFile);
    let temperature = 20.0;

    for (const point of route) {
        // Verifica que las coordenadas existan
        if (!point || point.length < 2) {
            console.error('Punto GPS inválido:', point);
            continue;
        }

        // Crear el payload con coordenadas
        const payload = `t|${temperature.toFixed(1)}|ac|${acState ? 'on' : 'off'}|gps|${point[1]},${point[0]}`;
        console.log(`Enviando datos: ${payload}`);

        try {
            await sendToIota(payload);
        } catch (error) {
            console.error('Error al enviar datos a IOTA:', error);
            break;
        }

        // Actualizar la temperatura
        temperature += acState ? -(Math.random() * 0.5) : Math.random() * 0.5;
        temperature = Math.max(15, Math.min(temperature, 30));

        // Esperar 1 segundo antes de enviar el siguiente punto
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Consultar los bloques enviados
    await queryBlocks();
}

// Carga la ruta desde un archivo JSON
function loadRoute(routeFile: string): number[][] {
    const filePath = path.resolve(routeFile);

    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al cargar el archivo de ruta:', error);
        return [];
    }
}

// Configura el sistema de entrada para cambiar el estado del aire acondicionado
function setupUserInput() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log('Comandos: ON (enciende AC), OFF (apaga AC), EXIT (detener simulación)');
    rl.on('line', (input) => {
        const command = input.trim().toUpperCase();
        if (command === 'ON') {
            acState = true;
            console.log('Aire acondicionado encendido.');
        } else if (command === 'OFF') {
            acState = false;
            console.log('Aire acondicionado apagado.');
        } else if (command === 'EXIT') {
            console.log('Saliendo de la simulación...');
            rl.close();
            process.exit(0);
        } else {
            console.log('Comando inválido. Usa ON, OFF o EXIT.');
        }
    });
}

// Consulta y decodifica los datos de los bloques enviados
// Consulta y decodifica los datos de los bloques enviados
async function queryBlocks() {
    const wallet = await initializeWallet();
    const client = await wallet.getClient();

    for (const blockId of blockIds) {
        try {
            const block: Block = await client.getBlock(blockId);
            //console.log(`Detalles del bloque ${blockId}:`, JSON.stringify(block, null, 2));

            // Verificar si el bloque tiene un payload de tipo 'Transaction'
            if (block.payload && block.payload.type === PayloadType.Transaction) {
                const transactionPayload = block.payload as TransactionPayload;

                // Mostrar toda la estructura de la transacción para ver cómo acceder a los datos
                //console.log('Estructura completa de la transacción:', JSON.stringify(transactionPayload, null, 2));

                // Acceder a 'essence' y verificar si contiene lo que necesitamos
                const essence = transactionPayload.essence;

                // Usar un type assertion para permitir el acceso a 'payload' en 'essence'
                const essencePayload = (essence as any).payload; // Aseguramos que 'essence' tenga 'payload'

                // Verificar si el essencePayload es del tipo TaggedData
                if (essencePayload && essencePayload.type === PayloadType.TaggedData) {
                    const taggedDataPayload = essencePayload as TaggedDataPayload;

                    // Decodificar el 'data' (hexadecimal a UTF-8)
                    const dataHex = taggedDataPayload.data;
                    const decodedData = hexToUtf8(dataHex);
                    console.log(`Datos decodificados del bloque ${blockId}: \n`, decodedData,`\n`);
                } else {
                    console.log('El payload no es TaggedData.');
                }
            }
        } catch (error) {
            console.error(`Error al recuperar el bloque ${blockId}:`, error);
        }
    }
}


// Ejecuta la simulación
const routeFile = './vehicle001-route.json';
setupUserInput();
simulateTruck(routeFile).catch(err => console.error('Error en la simulación:', err));
