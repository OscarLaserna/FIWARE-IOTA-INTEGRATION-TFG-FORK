// Importar las bibliotecas necesarias
import { Utils } from '@iota/sdk';
import * as fs from 'fs';
import * as path from 'path';

// Obtener el número de wallet desde el nombre del archivo .env
const walletNumber = path.basename(__filename).match(/\d+/)?.[0];

if (!walletNumber) {
    console.error("❌ Error: No se pudo determinar el número de wallet.");
    process.exit(1);
}

// Construir la ruta al archivo .env correspondiente
const envFilePath = path.resolve(__dirname, `${walletNumber}.env`);

// Verificar si el archivo .env existe antes de cargarlo
if (!fs.existsSync(envFilePath)) {
    console.error(`❌ Error: El archivo ${walletNumber}.env no existe.`);
    process.exit(1);
}

// Función para actualizar el archivo .env con una nueva clave-valor
function updateEnvFile(key: string, value: string) {
    // Lee el contenido del archivo .env
    let envFileContent = fs.readFileSync(envFilePath, 'utf-8');

    // Si la clave ya existe, actualiza su valor; si no, agrégala al final
    const newEnvFileContent = envFileContent.includes(`${key}=`)
        ? envFileContent.split('\n').map(line => 
            line.startsWith(key) ? `${key}=${value}` : line
        ).join('\n')
        : `${envFileContent}\n${key}=${value}`;

    // Escribe el contenido actualizado de nuevo en el archivo .env
    fs.writeFileSync(envFilePath, newEnvFileContent, 'utf-8');
}

// Función asincrónica principal
async function run() {
    try {
        // Genera una nueva clave mnemotécnica usando la utilidad de IOTA
        const mnemonic = Utils.generateMnemonic();

        // Imprime la clave mnemotécnica en la consola
        console.log(`🔑 Wallet${walletNumber} Mnemonic: ${mnemonic}`);

        // Actualiza el archivo .env de la wallet con la nueva clave mnemotécnica
        updateEnvFile('MNEMONIC', mnemonic);
    } catch (error) {
        // Captura y muestra cualquier error que ocurra durante la ejecución
        console.error('❌ Error: ', error);
    }
}

// Ejecutar el script
run().then(() => process.exit());
