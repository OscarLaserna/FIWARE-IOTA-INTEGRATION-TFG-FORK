import { Worker } from 'worker_threads';
import * as path from 'path';

const NUM_TRUCKS = 2;
const ROUTE_FILE = './vehicle001-route.json';

for (let truckId = 1; truckId <= NUM_TRUCKS; truckId++) {
    const walletChoice = truckId % 2 === 0 ? 1 : 3; // Alterna entre Wallet1 y Wallet3

    const worker = new Worker(path.resolve(__dirname, 'workercodigo.js'), {
        workerData: { truckId, routeFile: ROUTE_FILE, walletChoice }
    });

    worker.on('message', (msg) => console.log(`🚛 Truck ${truckId}:`, msg));
    worker.on('error', (err) => console.error(`❌ Error in Truck ${truckId}:`, err));
    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`⚠️ Truck ${truckId} stopped with exit code ${code}`);
        }
    });
}
