// Importar las bibliotecas necesarias
import { Wallet, initLogger } from '@iota/sdk';
// Carga las variables de entorno desde un archivo .env
require('dotenv').config({ path: '.env' });
const accountName = process.env.ACCOUNT_NAME;

// Función asincrónica principal
async function run() {
    // Inicializa el logger
    initLogger();
    // Verifica que la variable de entorno WALLET_DB_PATH esté definida
    for (const envVar of ['WALLET_DB_PATH']) {
        if (!(envVar in process.env)) {
            throw new Error(`.env ${envVar} is undefined, see .env.example`);
        }
    }
    try {
        // Crea una nueva instancia de Wallet utilizando la ruta de almacenamiento especificada en las variables de entorno
        const wallet = new Wallet({
            storagePath: process.env.WALLET_DB_PATH,
        });

        // Obtiene la cuenta llamada 'Wallet1' desde la billetera
        const account = await wallet.getAccount('Wallet1');
        // Sincroniza el balance de la cuenta
        const _syncBalance = await account.sync();

        // Obtiene las direcciones asociadas a la cuenta
        const addresses = await account.addresses();
        // Imprime las direcciones en la consola
        console.log(`${accountName}'s Address(es):`);
        console.log(addresses, '\n');
        // Obtiene el balance total de la cuenta
        const balance = await account.getBalance();
        // Imprime el balance en la consola
        console.log(`${accountName}'s Total Balance:`);
        console.log(balance, '\n');
    } catch (error) {
        // Captura y muestra cualquier error que ocurra durante la ejecución
        console.error('Error: ', error);
    }
}
run().then(() => process.exit());