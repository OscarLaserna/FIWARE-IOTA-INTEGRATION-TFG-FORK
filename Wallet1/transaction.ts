// Importar las bibliotecas necesarias
import { Wallet, initLogger, CoinType } from '@iota/sdk';
require('dotenv').config({ path: '.env' });

// Función asincrónica principal
async function run() {
    initLogger();
    try {
        // Verifica que las variables de entorno necesarias estén definidas
        for (const envVar of [
            'SH_PASSWORD',
            'WALLET_DB_PATH',
            'EXPLORER_URL',
        ]) {
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
        await wallet.setStrongholdPassword(
            process.env.SH_PASSWORD as string,
        );

        // Define la dirección de destino y la cantidad a enviar
        const address =
            'rms1qrrv7flg6lz5cssvzv2lsdt8c673khad060l4quev6q09tkm9mgtupgf0h0';
        const amount = BigInt(1000000); // Cantidad a enviar en la transacción

        // Envía la cantidad especificada a la dirección de destino
        const response = await account.send(amount, address);

        // Imprime en la consola el enlace al bloque enviado usando la URL del explorador
        console.log(
            `Block sent: ${process.env.EXPLORER_URL}/block/${response.blockId}`,
        );
    } catch (error) {
        // Captura y muestra cualquier error que ocurra durante la ejecución
        console.error('Error: ', error);
    }
}
run().then(() => process.exit());