import { Utils } from '@iota/sdk';
import * as fs from 'fs';
import * as path from 'path';

// Número de wallets a modificar
const NUM_WALLETS = 10; // Ajusta este número según las wallets que necesites

// Función para actualizar el archivo .env con una nueva clave-valor
function updateEnvFile(walletNumber: number, key: string, value: string) {
    const envFileName = `${walletNumber}.env`;
    const envPath = path.resolve(__dirname, envFileName);
    
    if (!fs.existsSync(envPath)) {
        console.error(`❌ Archivo ${envFileName} no encontrado.`);
        return;
    }
    
    let envFileContent = fs.readFileSync(envPath, 'utf-8');
    let updated = false;
    
    let newEnvFileContent = envFileContent.split('\n').map(line => {
        if (line.trim().startsWith(`${key}=`)) {
            updated = true;
            return `${key}='${value}'`; // Sustituye la línea existente con comillas
        }
        return line;
    }).join('\n');

    if (!updated) {
        console.error(`⚠️ No se encontró la clave ${key} en ${envFileName}.`);
        return;
    }

    fs.writeFileSync(envPath, newEnvFileContent, 'utf-8');
    console.log(`✅ Archivo ${envFileName} actualizado con ${key}.`);
}

// Función principal para generar y actualizar mnemonics
async function generateMnemonics() {
    for (let i = 1; i <= NUM_WALLETS; i++) {
        try {
            const mnemonic = Utils.generateMnemonic();
            console.log(`Mnemonic para Wallet${i}: '${mnemonic}'`); // Mostrar con comillas
            updateEnvFile(i, 'MNEMONIC', mnemonic);
        } catch (error) {
            console.error(`❌ Error al generar mnemonic para Wallet${i}:`, error);
        }
    }
    console.log('🎉 Todos los archivos .env han sido actualizados con sus mnemonics.');
}

generateMnemonics().then(() => process.exit());
