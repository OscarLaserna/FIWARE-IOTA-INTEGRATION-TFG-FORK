// Importar las bibliotecas necesarias
import { Wallet, initLogger, CoinType, TransactionPayload, TaggedDataPayload, PayloadType, RegularTransactionEssence } from '@iota/sdk';
import * as mqtt from 'mqtt'; 
import { MongoClient } from 'mongodb'; 
import { Buffer } from 'buffer';
require('dotenv').config({ path: '.env' }); 
 

// Configurar los logs 
initLogger();

// Función para introducir retraso entre comprobaciones
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para convertir hexadecimal a string UTF-8
function hexToUtf8(hex: string): string {
    const hexStr = hex.startsWith('0x') ? hex.slice(2) : hex;
    return Buffer.from(hexStr, 'hex').toString('utf8');
}

// Función para convertir string UTF-8 a hexadecimal
function utf8ToHex(str: string): string {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}

// Configuración de MQTT
const mqttClient = mqtt.connect('mqtt://localhost:1883'); // Conecta a Mosquitto 

// Configuración de MongoDB
// if (!process.env.MONGODB_URI) {
//     throw new Error("La variable de entorno MONGODB_URI no está definida.");
// }
const mongoClient = new MongoClient(process.env.MONGODB_URI); 
const dbName = process.env.MONGODB_DB_NAME; 

// Evento que se ejecuta cuando se establece la conexión MQTT
mqttClient.on('connect', () => {
    console.log('Conectado al broker MQTT');
    mqttClient.subscribe('/+/+/cmd', (err) => { // Suscribirse al tópico '/+/+/cmd'
        if (err) {
            console.error('Error al suscribirse al tópico:', err);
        } else {
            console.log('Suscrito al tópico: /+/+/cmd');
        }
    });
});

// Evento que se ejecuta cuando hay un error en la conexión MQTT
mqttClient.on('error', (error) => {
    console.error('Error al conectar a Mosquitto:', error);
});

// Variables para la billetera y la cuenta IOTA
let wallet: Wallet | null = null;
let account: any;

// Función para inicializar la billetera
async function initializeWallet() {
    if (wallet) {
        return; // Si la billetera ya está inicializada, no hacer nada
    }

    try {
        // Verificar que todas las variables de entorno necesarias estén definidas
        for (const envVar of ['SH_PASSWORD', 'WALLET_DB_PATH', 'EXPLORER_URL', 'NODE_URL']) {
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
        account = await wallet.getAccount('Wallet1');
        await account.sync();
        await wallet.setStrongholdPassword(process.env.SH_PASSWORD as string);
    } catch (error) {
        console.error('Error inicializando la billetera:', error);
        process.exit(1);
    }
}

// Función para enviar una transacción desde la billetera
async function sendTransaction(destinationAddress: string, tag: string, data: string) {
    if (!wallet || !account) {
        console.error('La billetera no está inicializada');
        return; // No hacer nada si la billetera no está inicializada
    }

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
    await initializeWallet(); // Inicializar la billetera

    if (!wallet || !account) {
        throw new Error('La billetera no está inicializada correctamente.');
    }

    // Almacenar IDs de transacciones conocidas para no mostrarlas repetidamente
    let knownTransactionIds = new Set();

    // Cargar transacciones existentes una sola vez al inicio para evitar mostrarlas como nuevas
    await account.sync({ syncIncomingTransactions: true });
    const initialTransactions = await account.incomingTransactions();
    initialTransactions.forEach(tx => knownTransactionIds.add(tx.transactionId));

    // Loop infinito para monitorear continuamente las transacciones entrantes
    while (true) {
        try {
            await account.sync({ syncIncomingTransactions: true }); // Sincronizar la cuenta
            const incomingTransactions = await account.incomingTransactions(); // Obtener las transacciones entrantes

            // Filtrar y mostrar solo las nuevas transacciones
            const newTransactions = incomingTransactions.filter(tx => !knownTransactionIds.has(tx.transactionId));
            if (newTransactions.length > 0) {
                console.log('Transacciones entrantes nuevas:');
                newTransactions.forEach(tx => {
                    console.log(`ID de transacción: ${tx.transactionId}`);
                    knownTransactionIds.add(tx.transactionId);  // Agregar al conjunto de conocidas
                    
                    // Verificar si es un TaggedDataPayload
                    const payload = tx.payload as TransactionPayload;
                    const essence = payload.essence as RegularTransactionEssence;
                    
                    if (essence.payload && essence.payload.type === PayloadType.TaggedData) {
                        const taggedDataPayload = essence.payload as TaggedDataPayload;
                        const tag = hexToUtf8(taggedDataPayload.tag);
                        const data = hexToUtf8(taggedDataPayload.data);

                        console.log(`Tag: ${tag}`);
                        console.log(`Datos: ${data}`);

                        // Publicar datos en Mosquitto utilizando el tag como tópico
                        const topic = tag; // Utiliza el tag como el tópico
                        const message = data; // Los datos ya están en formato UltraLight 2.0
                        mqttClient.publish(topic, message, {}, (err) => {
                            if (err) {
                                console.error('Error al publicar en Mosquitto:', err);
                            } else {
                                console.log(`Datos publicados en Mosquitto en el tópico ${topic}: ${message}`);
                            }
                        });
                    }
                });
            } else {
                console.log('No hay transacciones nuevas en este momento.');
            }

            await delay(5000);  // Esperar 5 segundos antes de hacer una nueva comprobación
        } catch (error) {
            console.error('Error al sincronizar la cuenta:', error);
            await delay(5000);  // Esperar 5 segundos antes de intentar sincronizar de nuevo
        }
    }
}

// Manejar mensajes MQTT
mqttClient.on('message', async (topic, message) => {
    console.log(`Mensaje recibido del tópico ${topic}: ${message.toString()}`);
    const command = message.toString();
    const [deviceId, commandPart] = command.split('@');

    // Extraer apikey y device_id del tópico
    const topicParts = topic.split('/');
    const apikey = topicParts[1];
    const deviceIdFromTopic = topicParts[2];

    try {
        await mongoClient.connect(); // Conectar a MongoDB
        const db = mongoClient.db(dbName);
        const collection = db.collection('devices');

        // Buscar el dispositivo en la base de datos usando device_id y apikey
        const device = await collection.findOne({ device_id: deviceIdFromTopic, apikey: apikey });
        if (device) {
            console.log(`Dirección de wallet para ${deviceIdFromTopic} (APIKEY: ${apikey}): ${device.wallet_address}`);
            await sendTransaction(device.wallet_address, topic, command); // Enviar transacción si se encuentra el dispositivo
        } else {
            console.error(`No se encontró la dirección de wallet para ${deviceIdFromTopic} con APIKEY: ${apikey}`);
        }
    } catch (err) {
        console.error('Error al conectar con MongoDB:', err);
    } finally {
        await mongoClient.close(); // Cerrar la conexión a MongoDB
    }
});

// Ejecuta la función de monitoreo
monitorWallet();
