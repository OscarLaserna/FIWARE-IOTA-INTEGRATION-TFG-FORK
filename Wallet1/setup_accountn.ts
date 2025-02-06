// const { AccountManager, CoinType } = require('@iota/wallet');
// const path = require('path');
// const fs = require('fs');
// require('dotenv').config();

// // Obtener el número de wallet desde el nombre del archivo .env
// const walletNumber = path.basename(__filename).match(/\d+/)?.[0];

// if (!walletNumber) {
//     console.error("❌ Error: No se pudo determinar el número de wallet.");
//     process.exit(1);
// }

// // Construir la ruta al archivo .env correspondiente
// const envFilePath = path.resolve(__dirname, `${walletNumber}.env`);

// // Verificar si el archivo .env existe antes de cargarlo
// if (!fs.existsSync(envFilePath)) {
//     console.error(`❌ Error: El archivo ${walletNumber}.env no existe.`);
//     process.exit(1);
// }

// // Cargar el archivo .env de la wallet específica
// require('dotenv').config({ path: envFilePath });

// const password = process.env.SH_PASSWORD;
// const mnemonic = process.env.MNEMONIC;
// const accountName = process.env.ACCOUNT_NAME;
// const nodeURL = process.env.NODE_URL;

// async function run() {
//     try {
//         console.log(`🚀 Configurando Wallet${walletNumber}...`);

//         // Configuración del AccountManager
//         const accountManagerOptions = {
//             storagePath: `./Wallet${walletNumber}-database`,  
//             clientOptions: {
//                 nodes: [nodeURL],  
//                 localPow: true,
//             },   
//             coinType: CoinType.Shimmer, 
//             secretManager: {
//                 Stronghold: {
//                     snapshotPath: `./wallet${walletNumber}.stronghold`,  
//                     password: password,  
//                 },
//             },
//         };

//         // Crear instancia del AccountManager
//         const manager = new AccountManager(accountManagerOptions);

//         // Almacenar la mnemónica en el AccountManager
//         await manager.storeMnemonic(mnemonic);

//         // Crear una nueva cuenta con el alias especificado
//         const account = await manager.createAccount({ alias: accountName });

//         console.log(`✅ Wallet${walletNumber} creada con éxito:`);
//         console.log(account, '\n');

//         // Sincronizar la cuenta con la red
//         await account.sync();

//         // Obtener y mostrar direcciones
//         const address = await account.addresses();
//         console.log(`🏦 Dirección de Wallet${walletNumber}:`);
//         console.log(address, '\n');

//     } catch (error) {
//         console.error('❌ Error: ', error);
//     }
//     process.exit(0);
// }

// // Ejecutar el script
// run();
