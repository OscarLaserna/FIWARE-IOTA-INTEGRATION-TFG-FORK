const { AccountManager, CoinType } = require('@iota/wallet');
const networkConfig = require('./networkConfig.js');
const nodeURL = networkConfig.node;
const fs = require('fs');
const path = require('path');

const NUM_WALLETS = 10;

function updateEnvFile(envFilePath: string, key: string, value: string) {
    let envContent = '';
    if (fs.existsSync(envFilePath)) {
        envContent = fs.readFileSync(envFilePath, 'utf8');
    }
    
    const envLines = envContent.split('\n');
    let updated = false;
    
    const newEnvLines = envLines.map(line => {
        if (line.startsWith(`${key}=`)) {
            updated = true;
            return `${key}=${value}`;
        }
        return line;
    });
    
    if (!updated) {
        newEnvLines.push(`${key}=${value}`);
    }
    
    fs.writeFileSync(envFilePath, newEnvLines.join('\n'), 'utf8');
    console.log(`📁 Archivo .env actualizado: ${key}=${value}`);
}

async function setupWallet(walletNumber: number) {
    try {
        const envFilePath = path.resolve(__dirname, `${walletNumber}.env`);
        if (!fs.existsSync(envFilePath)) {
            console.error(`❌ Archivo ${walletNumber}.env no encontrado.`);
            return;
        }

        require('dotenv').config({ path: walletNumber !== 1 ? `./${walletNumber}.env` : './.env', override: true });

        const password = process.env.SH_PASSWORD;
        const mnemonic = process.env.MNEMONIC;
        const accountName = process.env.ACCOUNT_NAME;

        if (!mnemonic || !password || !accountName) {
            console.error(`⚠️ Faltan variables en ${walletNumber}.env`);
            return;
        }

        const storagePath = path.resolve(__dirname, `${accountName}-database`);
        const strongholdPath = path.resolve(__dirname, `wallet${walletNumber}.stronghold`);

        if (fs.existsSync(storagePath)) {
            fs.rmSync(storagePath, { recursive: true, force: true });
            console.log(`🗑️ Base de datos eliminada: ${storagePath}`);
        }

        if (fs.existsSync(strongholdPath)) {
            fs.unlinkSync(strongholdPath);
            console.log(`🗑️ Archivo Stronghold eliminado: wallet${walletNumber}.stronghold`);
        }

        const accountManagerOptions = {
            storagePath: storagePath,
            clientOptions: {
                nodes: [nodeURL],
                localPow: true,
            },
            coinType: CoinType.Shimmer,
            secretManager: {
                Stronghold: {
                    snapshotPath: strongholdPath,
                    password: password,
                },
            },
        };

        const manager = new AccountManager(accountManagerOptions);
        await manager.storeMnemonic(mnemonic);
        const account = await manager.createAccount({ alias: accountName });

        console.log(`✅ Wallet${walletNumber} creada con éxito.`);
        console.log(`${accountName}'s Account:`, account);

        await account.sync();

        const addresses = await account.addresses();
        if (addresses.length > 0) {
            const walletAddress = addresses[0].address;
            console.log(`${accountName}'s Address: ${walletAddress}`);
            updateEnvFile(envFilePath, 'WALLET_ADDRESS', walletAddress);
        } else {
            console.error(`❌ No se encontraron direcciones para Wallet${walletNumber}`);
        }

    } catch (error) {
        console.error(`❌ Error en Wallet${walletNumber}:`, error);
    }
}

async function setupAllWallets() {
    for (let i = 5; i <= NUM_WALLETS; i++) {
        await setupWallet(i);
    }
    console.log('🎉 Todas las wallets han sido configuradas.');
}

setupAllWallets().then(() => process.exit(0));
