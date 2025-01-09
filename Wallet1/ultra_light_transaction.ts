// Importar las bibliotecas necesarias
import { Wallet, initLogger, CoinType, Utils, PayloadType, TaggedDataPayload } from '@iota/sdk';
import { Buffer } from 'buffer';
// Carga las variables de entorno desde un archivo .env
require('dotenv').config({ path: '.env' });
// Importa prompt-sync para leer entradas del usuario
const prompt = require('prompt-sync')({ sigint: true });

// Función para convertir una cadena UTF-8 a hexadecimal
function utf8ToHex(str: string): string {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}

// Función asincrónica principal
async function run() {
    initLogger();
    try {
        // Verifica que las variables de entorno necesarias estén definidas
        for (const envVar of ['SH_PASSWORD', 'WALLET_DB_PATH', 'EXPLORER_URL', 'NODE_URL']) {
            if (!(envVar in process.env)) {
                throw new Error(`.env ${envVar} is not defined`);
            }
        }

        // Crea una nueva instancia de Wallet con las opciones especificadas
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

        // Obtiene la cuenta 
        const account = await wallet.getAccount('Wallet1');

        // Sincroniza la cuenta con la red
        await account.sync();
        await wallet.setStrongholdPassword(process.env.SH_PASSWORD as string);

        // Define la dirección de destino y la cantidad a enviar
        const address = 'rms1qr69y65kxmcxy0dxjh6f8at8vqc270g37a9ku5ewkk72q5gwgt83x3lwj8j';
        const amount = BigInt(1000000); // Cantidad a enviar en la transacción

        // Solicita al usuario que introduzca el dato del payload
        const payloadValue = prompt('Introduce el valor de la temperatura ');

        // Construye el payload
        const payload = `t|${payloadValue}`;

        // Crea un payload de datos etiquetados
        const taggedDataPayload: TaggedDataPayload = {
            type: PayloadType.TaggedData,
            tag: utf8ToHex('/ul/iot1234/device001/attrs'),
            data: utf8ToHex(payload),
            getType: () => PayloadType.TaggedData,
        };

        // Envía la cantidad especificada a la dirección de destino con el payload de datos etiquetados
        const response = await account.send(amount, address, { taggedDataPayload });

        // Imprime en la consola el enlace al bloque enviado usando la URL del explorador
        console.log(`Block sent: ${process.env.EXPLORER_URL}/block/${response.blockId}`);
    } catch (error) {
        // Captura y muestra cualquier error que ocurra durante la ejecución
        console.error('Error: ', error);
    }
}
run().then(() => process.exit());
