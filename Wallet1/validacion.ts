import { Wallet, CoinType, TaggedDataPayload, PayloadType } from '@iota/sdk';
require('dotenv').config();

// Función para convertir una cadena UTF-8 a hexadecimal
function utf8ToHex(str: string): string {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}

let walletInstance: Wallet | null = null;

// Inicializar la wallet una sola vez
async function initializeWallet(): Promise<Wallet> {
    if (!walletInstance) {
        walletInstance = new Wallet({
            storagePath: process.env.WALLET_DB_PATH!,
            clientOptions: {
                nodes: [process.env.NODE_URL!],
            },
            coinType: CoinType.Shimmer,
            secretManager: {
                stronghold: {
                    snapshotPath: './v3.stronghold',
                    password: process.env.SH_PASSWORD!,
                },
            },
        });
    }
    return walletInstance;
}

// Envía datos a IOTA y mide el tiempo de validación
async function sendToIotaAndMeasure(payload: string) {
    const wallet = await initializeWallet();
    const account = await wallet.getAccount(process.env.ACCOUNT_NAME!);
    await account.sync();

    const address = 'rms1qpun0fuekhvjvyhesrnehuvuxq6p2rlwapflg073vtx450ntderdjqjr74w';
    const taggedDataPayload: TaggedDataPayload = {
        type: PayloadType.TaggedData,
        tag: utf8ToHex('/ul/iot1234/device001/attrs'),
        data: utf8ToHex(payload),
        getType: () => PayloadType.TaggedData,
    };

    // Marca el tiempo inicial
    const startTime = Date.now();

    // Envía los datos a IOTA
    const response = await account.send(BigInt(50600), address, { taggedDataPayload });
    console.log(`Block sent: ${process.env.EXPLORER_URL!}/block/${response.blockId}`);

    // Espera hasta que el bloque esté confirmado
    const client = await wallet.getClient();
    let confirmed = false;

    while (!confirmed) {
        const blockMetadata = await client.getBlockMetadata(response.blockId!);

        // Ajustar verificación de confirmación
        if (blockMetadata && blockMetadata.blockId && blockMetadata.referencedByMilestoneIndex) {
            confirmed = true;
        } else {
            console.log("Block not yet confirmed, retrying...");
            await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo antes de volver a consultar
        }
    }

    // Calcula el tiempo total
    const endTime = Date.now();
    const validationTime = (endTime - startTime) / 1000; // En segundos
    console.log(`Validation time: ${validationTime} seconds`);
}


(async () => {
    const payload = "t|18.0|ac|on|gps|10.4,20.8";
    try {
        await sendToIotaAndMeasure(payload);
    } catch (error) {
        console.error('Error:', error);
    }
})();