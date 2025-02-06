// Importar las bibliotecas necesarias
import { Utils } from '@iota/sdk';
import * as fs from 'fs';
import * as path from 'path';

// Función para actualizar el archivo .env con una nueva clave-valor
function updateEnvFile(key: string, value: string) {
    // Obtiene la ruta absoluta del archivo .env
    const envPath = path.resolve('2.env');
    // Lee el contenido del archivo .env
    const envFileContent = fs.readFileSync(envPath, 'utf-8');
    // Actualiza la línea que comienza con la clave especificada
    const newEnvFileContent = envFileContent.split('\n').map(line => {
        if (line.startsWith(key)) {
            return `${key} = '${value}'`;
        }
        return line;
    }).join('\n');
    // Escribe el contenido actualizado de nuevo en el archivo .env
    fs.writeFileSync(envPath, newEnvFileContent, 'utf-8');
}

// Función asincrónica principal
async function run() {
    try {
        // Genera una nueva clave mnemotécnica usando la utilidad de IOTA
        const mnemonic = Utils.generateMnemonic();
        // Imprime la clave mnemotécnica en la consola
        console.log('Mnemonic: ' + mnemonic);

        // Actualiza el archivo .env con la nueva clave mnemotécnica
        updateEnvFile('MNEMONIC', mnemonic);
    } catch (error) {
        // Captura y muestra cualquier error que ocurra durante la ejecución
        console.error('Error: ', error);
    }
}

run().then(() => process.exit());
