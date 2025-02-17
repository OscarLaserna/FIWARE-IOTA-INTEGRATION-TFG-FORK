const { AccountManager, CoinType } = require('@iota/wallet');
const networkConfig = require('./networkConfig.js');
const nodeURL = networkConfig.node;
const fs = require('fs');
const path = require('path');

const NUM_WALLETS: number = 10;

function deleteFolderRecursive(folderPath: string): void {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((file: string) => {  // <-- Agregado ": string"
            const curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folderPath);
        console.log(`🗑️ Base de datos eliminada: ${folderPath}`);
    }
}


async function setupWallet(walletNumber: number): Promise<void> {
    try {
        const envFilePath: string = path.resolve(__dirname, `${walletNumber}.env`);
        if (!fs.existsSync(envFilePath)) {
            console.error(`❌ Archivo ${walletNumber}.env no encontrado.`);
            return;
        }

        require('dotenv').config({ path: walletNumber !== 1 ? `./${walletNumber}.env` : './.env', override: true });

        const password: string | undefined = process.env.SH_PASSWORD;
        const mnemonic: string | undefined = process.env.MNEMONIC;
        const accountName: string | undefined = process.env.ACCOUNT_NAME;

        if (!mnemonic || !password || !accountName) {
            console.error(`⚠️ Faltan variables en ${walletNumber}.env`);
            return;
        }

        // Ruta de almacenamiento de la base de datos
        const storagePath = path.resolve(__dirname, `${accountName}-database`);

        // Ruta del archivo Stronghold
        const strongholdPath = path.resolve(__dirname, `wallet${walletNumber}.stronghold`);

        // Eliminar la base de datos y el archivo Stronghold si existen
        deleteFolderRecursive(storagePath);

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

        const account = await manager.createAccount({
            alias: accountName,
        });

        console.log(`✅ Wallet${walletNumber} creada con éxito.`);
        console.log(`${accountName}'s Account:`);
        console.log(account, '\n');

        await account.sync();

        const addresses = await account.addresses();
        if (addresses.length > 0) {
            console.log(`${accountName}'s Address: ${addresses[0].address}`);
        } else {
            console.error(`❌ No se encontraron direcciones para Wallet${walletNumber}`);
        }

    } catch (error) {
        console.error(`❌ Error en Wallet${walletNumber}:`, error);
    }
}

async function setupAllWallets(): Promise<void> {
    for (let i: number = 4; i <= NUM_WALLETS; i++) {
        await setupWallet(i);
    }
    console.log('🎉 Todas las wallets han sido configuradas.');
}

setupAllWallets().then(() => process.exit(0));
