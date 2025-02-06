import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Número de wallets a crear
const NUM_WALLETS = 10; // Cambia este valor según cuántas wallets quieras crear

// Función para crear el archivo .env de cada wallet
function createEnvFile(walletNumber: number) {
    const envFileName = `${walletNumber}.env`;
    const envFilePath = path.resolve(__dirname, envFileName);
    
    const envContent = `ACCOUNT_NAME=Wallet${walletNumber}
        SH_PASSWORD=Oscar1234!
        MNEMONIC=
        EXPLORER_URL=https://explorer.shimmer.network/testnet
        WALLET_DB_PATH=./Wallet${walletNumber}-database
        NODE_URL=https://api.testnet.shimmer.network`;

    fs.writeFileSync(envFilePath, envContent, 'utf-8');
    console.log(`✅ Archivo ${envFileName} creado.`);
}

// Función para ejecutar un script con el archivo .env correcto
function runScript(scriptName: string, walletNumber: number) {
    const envFilePath = path.resolve(__dirname, `${walletNumber}.env`);
    console.log(`🚀 Ejecutando ${scriptName} con ${walletNumber}.env`);
    
    execSync(`node ${scriptName}`, {
        stdio: 'inherit',
        env: { ...process.env, ...require('dotenv').config({ path: envFilePath }).parsed }
    });

    console.log(`✅ ${scriptName} ejecutado para Wallet${walletNumber}.`);
}

// Función principal
async function main() {
    for (let i = 4; i <= NUM_WALLETS; i++) {
        createEnvFile(i);
        runScript('create_mnemonic.js', i);
        runScript('setup_account.js', i);
    }
    console.log('🎉 Todas las wallets han sido creadas.');
}

// Ejecutar el script
main().catch(console.error);
