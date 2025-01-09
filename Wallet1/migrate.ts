// Importa la función para migrar snapshots de Stronghold de la versión 2 a la versión 3 desde el SDK de IOTA
import { migrateStrongholdSnapshotV2ToV3 } from '@iota/sdk';
// Carga las variables de entorno desde un archivo .env
require('dotenv').config({ path: '.env' });

// Define la ruta del archivo Stronghold versión 2
const v2Path = './wallet.stronghold'; 
// Define la ruta del archivo Stronghold versión 3 que se creará
const v3Path = './v3.stronghold';     

// Función asincrónica principal
async function run() {
    try {
        // Realiza la migración del snapshot de Stronghold de la versión 2 a la versión 3
        await migrateStrongholdSnapshotV2ToV3(
            v2Path,                        
            process.env.SH_PASSWORD,       
            'wallet.rs',                   
            100,                           
            v3Path,                        
            process.env.SH_PASSWORD        
        );
        // Imprime un mensaje en la consola indicando que la migración se completó con éxito
        console.log('Migration completed successfully.');
    } catch (error) {
        // Captura y muestra cualquier error que ocurra durante la migración
        console.error('Error during migration: ', error);
    }
}

run();
