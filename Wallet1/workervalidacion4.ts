import { parentPort, workerData } from 'worker_threads';
import { Client, Wallet } from '@iota/sdk';
import * as fs from 'fs';
import * as path from 'path';

const { truckId, walletChoice, sentBlocks } = workerData;
let isProcessing = false;

if (walletChoice !== 1) {
    require('dotenv').config({ path: `./${walletChoice}.env` });
}

// Configuración del archivo de logs
const logFilePath = path.resolve(`./truck_${truckId}_validations.txt`);

// URL del nodo IOTA (debe estar en tu archivo .env)
const NODE_URL = process.env.NODE_URL || 'https://api.testnet.iotaledger.net';

// Inicializar el cliente de la red IOTA
async function initializeClient(): Promise<Client> {
    return new Client({
        nodes: [NODE_URL],
        localPow: true,
    });
}

// Inicializar la wallet
async function initializeWallet(): Promise<Wallet> {
    return new Wallet({
        storagePath: process.env.WALLET_DB_PATH!,
        clientOptions: { nodes: [NODE_URL] },
        coinType: 4219,
        secretManager: {
            stronghold: {
                snapshotPath: `./wallet${walletChoice}.stronghold`,
                password: process.env.SH_PASSWORD!,
            },
        },
    });
}

// Función para obtener los metadatos de un bloque
async function getBlockMetadata(blockId: string): Promise<any> {
    const client = await initializeClient();
    return await client.getBlockMetadata(blockId);
}

// Función para calcular el tiempo de validación
function calculateValidationTime(blockTimestamp: number, milestoneTimestamp: number): number {
    return milestoneTimestamp - blockTimestamp;
}

// Función para escribir en el archivo de logs
function logValidation(message: string): void {
    fs.writeFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`, { flag: 'a' });
}

// Procesar los bloques
(async () => {
    isProcessing = true;

    // Inicializar la wallet y el cliente
    const wallet = await initializeWallet();
    const client = await initializeClient();

    // Procesar todos los bloques en la cola
    for (const blockId of sentBlocks) {
        let isBlockConfirmed = false;

        while (!isBlockConfirmed) {
            try {
                const blockMetadata = await getBlockMetadata(blockId);

                // Verificar si el bloque ha sido confirmado
                if (blockMetadata?.referencedByMilestoneIndex && blockMetadata.blockTimestamp && blockMetadata.milestoneTimestamp) {
                    const validationTime = calculateValidationTime(blockMetadata.blockTimestamp, blockMetadata.milestoneTimestamp);
                    logValidation(`✅ Camión ${truckId}: Bloque ${blockId} validado en ${validationTime} segundos.`);
                    isBlockConfirmed = true; // El bloque está confirmado, salir del bucle
                } else {
                    // El bloque no está confirmado, esperar 1 segundo antes de reintentar
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                // Si hay un error, esperar 1 segundo antes de reintentar
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    // Cerrar la wallet y el cliente
    await wallet.destroy();
    isProcessing = false;

    // Finalizar el worker correctamente
    parentPort?.postMessage({ type: 'validation_finished' });
    process.exit(0);
})();