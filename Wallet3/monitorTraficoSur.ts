// Importar las bibliotecas necesarias
import mqtt from 'mqtt';
import { MongoClient } from 'mongodb';
import { Wallet, initLogger, CoinType, PayloadType, TaggedDataPayload } from '@iota/sdk';
import { Buffer } from 'buffer';
require('dotenv').config({ path: '.env' });

// Función para convertir string UTF-8 a hexadecimal
function utf8ToHex(str: string): string {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}

// Configuración del cliente MQTT
const mqttClient = mqtt.connect('mqtt://localhost:1883'); 

// Configuración de MongoDB
const mongoClient = new MongoClient(process.env.MONGODB_URI);
const dbName = process.env.MONGODB_DB_NAME;

// Evento que se ejecuta cuando se establece la conexión MQTT
mqttClient.on('connect', () => {
    console.log('Conectado al broker MQTT');
    // Suscribirse al tópico específico para recibir comandos
    mqttClient.subscribe('/+/+/cmd', (err) => {
        if (err) {
            console.error('Error al suscribirse al tópico:', err);
        } else {
            console.log('Suscrito al tópico: /+/+/cmd');
        }
    });
});

// Evento que se ejecuta cuando se recibe un mensaje en el tópico suscrito
mqttClient.on('message', async (topic, message) => {
    console.log(`Mensaje recibido del tópico ${topic}: ${message.toString()}`);
    const command = message.toString();
    const [deviceId, commandPart] = command.split('@');

    // Extraer apikey y device_id del tópico
    const topicParts = topic.split('/');
    const apikey = topicParts[1];
    const deviceIdFromTopic = topicParts[2];

    try {
        // Conectar a MongoDB y buscar la dirección de wallet asociada al dispositivo y apikey
        await mongoClient.connect();
        const db = mongoClient.db(dbName);
        const collection = db.collection('devices');

        const device = await collection.findOne({ device_id: deviceIdFromTopic, apikey: apikey });
        if (device) {
            console.log(`Dirección de wallet para ${deviceIdFromTopic} (APIKEY: ${apikey}): ${device.wallet_address}`);
            await sendTransaction(device.wallet_address, topic, command);
        } else {
            console.error(`No se encontró la dirección de wallet para ${deviceIdFromTopic} con APIKEY: ${apikey}`);
        }
    } catch (err) {
        console.error('Error al conectar con MongoDB:', err);
    } finally {
        await mongoClient.close();
    }
});

// Función para enviar una transacción desde la billetera
async function sendTransaction(destinationAddress: string, tag: string, data: string) {
    initLogger(); // Inicializar el logger
    try {
        // Verificar que todas las variables de entorno necesarias estén definidas
        for (const envVar of ['SH_PASSWORD', 'WALLET_DB_PATH', 'EXPLORER_URL', 'NODE_URL']) {
            if (!(envVar in process.env)) {
                throw new Error(`.env ${envVar} is not defined`);
            }
        }

        // Configurar la billetera con las opciones especificadas
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

        // Obtener la cuenta y sincronizarla
        const account = await wallet.getAccount('Wallet1');
        await account.sync();

        // Establecer la contraseña de Stronghold
        await wallet.setStrongholdPassword(process.env.SH_PASSWORD as string);

        const amount = BigInt(100000); // Cantidad a enviar
        const taggedDataPayload: TaggedDataPayload = {
            type: PayloadType.TaggedData,
            tag: utf8ToHex(tag), // Convertir el tag a hexadecimal
            data: utf8ToHex(data), // Convertir los datos a hexadecimal
            getType: () => PayloadType.TaggedData,
        };

        // Enviar la transacción
        const response = await account.send(amount, destinationAddress, { taggedDataPayload });

        // Mostrar el ID del bloque en el explorador
        console.log(`Transacción enviada: ${process.env.EXPLORER_URL}/block/${response.blockId}`);
    } catch (error) {
        console.error('Error enviando la transacción:', error);
    }
}
