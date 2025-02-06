import { Worker } from 'worker_threads';

function runWorker(truckId: number, routeFile: string, walletChoice: number): Worker {
    const worker = new Worker('./workercodigo3.js', {
        workerData: { truckId, routeFile, walletChoice },
    });

    worker.on('message', (message) => {
        console.log(message);
        if (message === '✅ Finished simulation') {
            // Aquí puedes manejar la terminación del worker si lo deseas.
        }
    });

    worker.on('error', (error) => {
        console.error('Worker error:', error);
    });

    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
    });

    return worker;
}

const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

let trucks: { [key: number]: Worker } = {};

// Inicializa los workers para cada camión
trucks[1] = runWorker(1, './vehicle001-route.json', 1);
trucks[3] = runWorker(3, './vehicle002-route.json', 3);

rl.on('line', (input: string) => {
    const [truckIdStr, command] = input.split(' ');

    if (truckIdStr === 'EXIT') {
        console.log('Stopping simulation...');
        rl.close();
        return;
    }

    const truckId = parseInt(truckIdStr);

    // Verificar que el truckId sea válido
    if (!trucks[truckId]) {
        console.log(`❌ No such truck with ID ${truckId}`);
        return;
    }

    if (command.toUpperCase() === 'ON' || command.toUpperCase() === 'OFF') {
        const acState = command.toUpperCase() === 'ON';

        // Enviar el mensaje solo al truck correspondiente
        trucks[truckId].postMessage({ acState });

        console.log(`✔️ Truck ${truckId}: AC turned ${command.toUpperCase()}`);
    } else {
        console.log('❌ Invalid command. Use "TRUCK_ID ON", "TRUCK_ID OFF", or "EXIT".');
    }
});
