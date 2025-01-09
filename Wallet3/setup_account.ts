const { AccountManager, CoinType } = require('@iota/wallet');
const networkConfig = require('./networkConfig.js');
const nodeURL = networkConfig.node;

// Carga las variables de entorno desde un archivo .env
require('dotenv').config();
const password = process.env.SH_PASSWORD;  
const mnemonic = process.env.MNEMONIC;     
const accountName = process.env.ACCOUNT_NAME;  

// Función asincrónica principal
async function run() {
  try {
    // Configuración de opciones para el AccountManager
    const accountManagerOptions = {
      storagePath: `./${accountName}-database`,  
      clientOptions: {
        nodes: [nodeURL],  
        localPow: true,
      },   
      coinType: CoinType.Shimmer, 
      secretManager: {
        Stronghold: {
          snapshotPath: `./wallet.stronghold`,  
          password: `${password}`,  
        },
      },
    };

    // Crea una nueva instancia de AccountManager con las opciones configuradas
    const manager = new AccountManager(accountManagerOptions);

    // Almacena la mnemónica en el AccountManager
    await manager.storeMnemonic(mnemonic);

    // Crea una nueva cuenta con el alias especificado
    const account = await manager.createAccount({
      alias: accountName,
    });

    // Imprime la información de la cuenta en la consola
    console.log(`${accountName}'s account:`);
    console.log(account, '\n');

    // Sincroniza la cuenta con la red
    await account.sync();

    // Obtiene las direcciones asociadas a la cuenta
    const address = await account.addresses();

    // Imprime las direcciones en la consola
    console.log(`${accountName}'s Address:`);
    console.log(address, '\n');

  } catch (error) {
    // Captura y muestra cualquier error que ocurra durante la ejecución
    console.log('Error: ', error);
  }
  process.exit(0);
}
run();