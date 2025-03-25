import { Client, Wallet } from '@iota/sdk';
import * as fs from 'fs';
import * as path from 'path';

// Obtener el ID del camión desde los argumentos de la línea de comandos
const truckId = process.argv[2];
if (!truckId) {
    console.error('❌ Debes proporcionar el ID del camión como argumento.');
    process.exit(1);
}

require('dotenv').config({ path: `./${truckId}.env` });

// Configuración del archivo de bloques
const blocksFilePath = path.resolve(`./camion${truckId}_bloques.txt`);
if (!fs.existsSync(blocksFilePath)) {
    console.error(`❌ No se encontró el archivo de bloques para el camión ${truckId}.`);
    process.exit(1);
}

// Configuración del archivo de logs
const logFilePath = path.resolve(`./truck_${truckId}_validations.txt`);
if (fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, ''); // Vaciar el archivo
    console.log(`✅ Contenido del archivo de validacion del camión ${truckId} eliminado.`);
} else {
    console.error(`❌ No se encontró el archivo de validacion para el camión ${truckId}.`);
}
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
                snapshotPath: `./wallet${truckId}.stronghold`,
                password: process.env.SH_PASSWORD!,
            },
        },
    });
}

// Función para obtener los metadatos de un bloque
async function getBlockMetadata(blockId: string): Promise<any> {
    const client = await initializeClient();
    const metadata = await client.getBlockMetadata(blockId);
    return metadata;
}

// Función para obtener los detalles de una milestone por su índice
async function getMilestoneDetails(milestoneIndex: number): Promise<any> {
    const client = await initializeClient();
    const milestoneDetails = await client.getMilestoneByIndex(milestoneIndex);
    return milestoneDetails;
}

// Función para calcular el tiempo de validación
function calculateValidationTime(sendTime: string, milestoneTimestamp: number): number {
    const sendTimestamp = new Date(sendTime).getTime(); // Convertir la hora de envío a timestamp en milisegundos
    const milestoneTimestampMs = milestoneTimestamp * 1000; // Convertir el timestamp de la milestone a milisegundos

    console.log('Hora de envío (ISO):', sendTime);
    console.log('Hora de envío (timestamp):', sendTimestamp);
    console.log('Timestamp de la milestone (segundos):', milestoneTimestamp);
    console.log('Timestamp de la milestone (milisegundos):', milestoneTimestampMs);

    const validationTimeMs = milestoneTimestampMs - sendTimestamp; // Diferencia en milisegundos
    const validationTimeSeconds = validationTimeMs / 1000; // Convertir a segundos

    return validationTimeSeconds; // Devolver el tiempo de validación en segundos
}

// Función para escribir en el archivo de logs
function logValidation(message: string): void {
    fs.writeFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`, { flag: 'a' });
}

// Procesar los bloques
(async () => {
    // Inicializar la wallet y el cliente
    const wallet = await initializeWallet();
    const client = await initializeClient();

    // Leer los bloques desde el archivo
    const blocks = fs.readFileSync(blocksFilePath, 'utf8').split('\n').filter(Boolean);

    // Procesar todos los bloques en la cola
    for (const blockLine of blocks) {
        const [blockId, sendTime] = blockLine.split(','); // Separar el ID del bloque y la hora de envío
        let isBlockConfirmed = false;
        const startTime = Date.now();
        const maxValidationTime = 600000; // 10 minutos en milisegundos

        while (!isBlockConfirmed && Date.now() - startTime < maxValidationTime) {
            try {
                console.log(`🔍 Validando bloque ${blockId}...`);

                const blockMetadata = await getBlockMetadata(blockId);

                // Verificar si el bloque ha sido referenciado por un milestone
                if (blockMetadata && blockMetadata.blockId && blockMetadata.referencedByMilestoneIndex) {
                    const milestoneIndex = blockMetadata.referencedByMilestoneIndex; // Índice de la milestone
                    const milestoneDetails = await getMilestoneDetails(milestoneIndex); // Obtener detalles de la milestone

                    if (milestoneDetails && milestoneDetails.timestamp) {
                        const milestoneTimestamp = milestoneDetails.timestamp; // Timestamp de la milestone

                        // Calcular el tiempo de validación usando la hora de envío y el timestamp de la milestone
                        const validationTime = calculateValidationTime(sendTime, milestoneTimestamp);
                        console.log(`✅ Bloque ${blockId} validado en ${validationTime} segundos por la milestone ${milestoneIndex}.`);
                        logValidation(`✅ Camión ${truckId}: Bloque ${blockId} validado en ${validationTime} segundos por la milestone ${milestoneIndex}.`);
                        isBlockConfirmed = true; // El bloque está confirmado, salir del bucle
                    } else {
                        console.error(`❌ No se pudieron obtener los detalles de la milestone ${milestoneIndex}.`);
                        logValidation(`❌ No se pudieron obtener los detalles de la milestone ${milestoneIndex}.`);
                    }
                } else {
                    // El bloque no está confirmado, esperar 1 segundo antes de reintentar
                    console.log(`⚠️ Bloque ${blockId} aún no ha sido confirmado. Reintentando en 1 segundo...`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                // Si hay un error, esperar 1 segundo antes de reintentar
                console.error(`❌ Error validando bloque ${blockId}: ${error}. Reintentando en 1 segundo...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        if (!isBlockConfirmed) {
            console.error(`❌ El bloque ${blockId} no se ha confirmado después de 10 minutos.`);
            logValidation(`❌ El bloque ${blockId} no se ha confirmado después de 10 minutos.`);
        }
    }

    // Cerrar la wallet y el cliente
    await wallet.destroy();
    console.log('✅ Validación completada.');
    process.exit(0);
})();