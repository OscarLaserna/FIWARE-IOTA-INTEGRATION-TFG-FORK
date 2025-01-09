// Importar las bibliotecas necesarias
import { Wallet, initLogger } from '@iota/sdk';
import { TransactionPayload, TaggedDataPayload, PayloadType, RegularTransactionEssence } from '@iota/sdk'; 
import * as mqtt from 'mqtt'; 

// Cargar las variables de entorno desde .env
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

// Configuración de MQTT
const mqttClient = mqtt.connect('mqtt://localhost:1883'); // Conecta a Mosquitto 

mqttClient.on('connect', () => {
    console.log('Conectado a Mosquitto');
});

mqttClient.on('error', (error) => {
    console.error('Error al conectar a Mosquitto:', error);
});

// Función principal que ejecuta el monitoreo
async function monitorWallet() {
    if (!process.env.WALLET_DB_PATH) {
        throw new Error(`La variable de entorno WALLET_DB_PATH no está definida.`);
    }

    try {
        const wallet = new Wallet({
            storagePath: process.env.WALLET_DB_PATH,
        });
        const account = await wallet.getAccount(process.env.ACCOUNT_NAME);
        
        // Almacenar IDs de transacciones conocidas para no mostrarlas repetidamente
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
        }
    } catch (error) {
        console.error('Error al monitorear la billetera:', error);
    }
}

// Ejecuta la función de monitoreo
monitorWallet();
