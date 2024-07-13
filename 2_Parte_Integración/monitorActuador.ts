// Importar las bibliotecas necesarias
import { Wallet, initLogger, CoinType, Utils } from '@iota/sdk';
import { TransactionPayload, TaggedDataPayload, PayloadType, RegularTransactionEssence } from '@iota/sdk';
import { Buffer } from 'buffer';
require('dotenv').config({ path: '.env' });

// Configurar los logs
initLogger();

// Función para convertir hexadecimal a string UTF-8
function hexToUtf8(hex: string): string {
    const hexStr = hex.startsWith('0x') ? hex.slice(2) : hex;
    return Buffer.from(hexStr, 'hex').toString('utf8');
}

// Función para convertir string UTF-8 a hexadecimal
function utf8ToHex(str: string): string {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}

// Función para introducir retraso entre comprobaciones
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Variables para la billetera y la cuenta IOTA
let wallet: Wallet | null = null;
let account: any;

// Función para inicializar la billetera
async function initializeWallet() {
    try {
        // Verificar que todas las variables de entorno necesarias estén definida
        for (const envVar of ['SH_PASSWORD', 'WALLET_DB_PATH', 'EXPLORER_URL', 'NODE_URL', 'ACCOUNT_NAME']) {
            if (!(envVar in process.env)) {
                throw new Error(`.env ${envVar} is not defined`);
            }
        }

        // Inicializa la billetera con la configuración especificada
        wallet = new Wallet({
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

        // Obtener la cuenta y sincronizarla
        account = await wallet.getAccount(process.env.ACCOUNT_NAME);
        await account.sync();
        await wallet.setStrongholdPassword(process.env.SH_PASSWORD as string);
    } catch (error) {
        console.error('Error inicializando la billetera:', error);
        process.exit(1); 
    }
}

// Función para enviar una transacción desde la billetera
async function sendTransaction(destinationAddress: string, tag: string, data: string) {
    try {
        const amount = BigInt(100000); // Cantidad a enviar
        const taggedDataPayload: TaggedDataPayload = {
            type: PayloadType.TaggedData,
            tag: utf8ToHex(tag), // Convertir el tag a hexadecimal
            data: utf8ToHex(data), // Convertir los datos a hexadecimal
            getType: () => PayloadType.TaggedData,
        };

        // Enviar la transacción
        const response = await account.send(amount, destinationAddress, { taggedDataPayload });

        // Mostrar el ID del bloque de la transacción en el explorador
        console.log(`Transacción enviada: ${process.env.EXPLORER_URL}/block/${response.blockId}`);
    } catch (error) {
        console.error('Error enviando la transacción:', error);
    }
}

// Función principal para monitorear la billetera
async function monitorWallet() {
    try {
        // Almacena IDs de transacciones conocidas para no mostrarlas repetidamente
        let knownTransactionIds = new Set();

        // Cargar transacciones existentes una sola vez al inicio para evitar mostrarlas como nuevas
        await account.sync({ syncIncomingTransactions: true });
        const initialTransactions = await account.incomingTransactions();
        initialTransactions.forEach(tx => knownTransactionIds.add(tx.transactionId));

        // Loop infinito para monitorear continuamente las transacciones entrantes
        while (true) {
            await account.sync({ syncIncomingTransactions: true });
            const incomingTransactions = await account.incomingTransactions();

            // Filtrar y mostrar solo las nuevas transacciones
            const newTransactions = incomingTransactions.filter(tx => !knownTransactionIds.has(tx.transactionId));
            if (newTransactions.length > 0) {
                console.log('Transacciones entrantes nuevas:');
                for (const tx of newTransactions) {
                    console.log(`ID de transacción: ${tx.transactionId}`);
                    knownTransactionIds.add(tx.transactionId); // Agregar al conjunto de conocidas

                    // Verificar y mostrar TaggedDataPayload si está disponible
                    const payload = tx.payload as TransactionPayload;
                    const essence = payload.essence as RegularTransactionEssence;

                    // Obtener la dirección de destino de la transacción entrante
                    const hash = tx.inputs[0].output.unlockConditions[0].address.pubKeyHash;
                    console.log(`Hash: ${hash}`);

                    // Convertir el hash a una dirección legible
                    const address = Utils.hexToBech32(hash, 'rms');
                    console.log(`Dirección: ${address}`);

                    if (essence.payload && essence.payload.type === PayloadType.TaggedData) {
                        const taggedDataPayload = essence.payload as TaggedDataPayload;
                        const tag = hexToUtf8(taggedDataPayload.tag);
                        const data = hexToUtf8(taggedDataPayload.data);
                        console.log(`Tag: ${tag}`);
                        console.log(`Datos: ${data}`);

                        // Enviar una transacción de respuesta si es un comando
                        if (tag.includes('/cmd')) {
                            const [apikey, deviceId] = tag.split('/').slice(1, 3); // Obtener correctamente apikey y deviceId
                            const responseTag = `/ul/${apikey}/${deviceId}/cmdexe`;

                            const [receivedDeviceId, command] = data.split('@');
                            const [commandName] = command.split('|');
                            const responseMessage = `${receivedDeviceId}@${commandName}|1`; // Respuesta

                            await sendTransaction(address, responseTag, responseMessage);
                        }
                    }
                }
            } else {
                console.log('No hay transacciones nuevas en este momento.');
            }

            await delay(5000); // Esperar 5 segundos antes de hacer una nueva comprobación
        }
    } catch (error) {
        console.error('Error al monitorear la billetera:', error);
    }
}

// Inicializa la billetera y comienza el monitoreo
initializeWallet().then(monitorWallet);
