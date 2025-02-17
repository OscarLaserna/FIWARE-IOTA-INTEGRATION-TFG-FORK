const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const networkConfig = require('./networkConfig.js');
const faucetApi = networkConfig.faucetApi;

const NUM_WALLETS = 10; // Ajusta según el número de wallets creadas

// Función para esperar un tiempo determinado (en milisegundos)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para obtener la dirección de una wallet desde su archivo .env
function getWalletAddress(walletNumber) {
    const envFilePath = path.resolve(__dirname, `${walletNumber}.env`);

    if (!fs.existsSync(envFilePath)) {
        console.error(`❌ Archivo ${walletNumber}.env no encontrado.`);
        return null;
    }

    require('dotenv').config({ path: walletNumber !== 1 ? `./${walletNumber}.env` : './.env', override: true });

    const walletAddress = process.env.WALLET_ADDRESS;

    if (!walletAddress) {
        console.error(`⚠️ No se encontró WALLET_ADDRESS en ${walletNumber}.env`);
        return null;
    }

    return walletAddress;
}

// Función para solicitar fondos desde el faucet
async function requestFunds(faucetUrl, addressBech32) {
    try {
        const response = await fetch(faucetUrl, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address: addressBech32 }),
        });

        const result = await response.json();
        console.log(`✅ Fondos solicitados para ${addressBech32}:`, result);
    } catch (error) {
        console.error(`❌ Error solicitando fondos para ${addressBech32}:`, error);
    }
}

// Función principal para iterar sobre todas las wallets y solicitar fondos con delay
async function requestFundsForAllWallets() {
    for (let i = 4; i <= NUM_WALLETS; i++) {
        const walletAddress = getWalletAddress(i);
        if (walletAddress) {
            await requestFunds(faucetApi, walletAddress);
            console.log(`⏳ Esperando 60 segundos antes de la próxima solicitud...`);
            await delay(60000); // Espera 60 segundos antes de la próxima solicitud
        }
    }
    console.log('🎉 Todas las solicitudes de faucet han sido enviadas.');
}

// Ejecutar la función principal
requestFundsForAllWallets();
