import { Worker } from 'worker_threads';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

// Configuración de la interfaz de lectura de consola
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let trucks: { [key: number]: Worker } = {};

// Función para iniciar el worker de un camión
function runWorker(truckId: number, routeFile: string, walletChoice: number): Worker {
    // Eliminar el contenido del archivo de bloques antes de iniciar el worker
    const blocksFilePath = path.resolve(`./camion${truckId}_bloques.txt`);
    if (fs.existsSync(blocksFilePath)) {
        fs.writeFileSync(blocksFilePath, ''); // Vaciar el archivo
        console.log(`✅ Contenido del archivo de bloques del camión ${truckId} eliminado.`);
    } else {
        console.error(`❌ No se encontró el archivo de bloques para el camión ${truckId}.`);
    }

    const worker = new Worker('./workercodigo5.js', {
        workerData: { truckId, routeFile, walletChoice },
    });

    worker.on('message', (message) => {
        console.log(message);
    });

    worker.on('error', (error) => console.error('Worker error:', error));
    worker.on('exit', (code) => {
        if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
    });

    return worker;
}

// Inicializar camiones
trucks[5] = runWorker(5, './vehicle001-route.json', 5);
// trucks[6] = runWorker(6, './vehicle002-route.json', 6);

// Escuchar comandos de la consola
rl.on('line', (input: string) => {
    const [truckIdStr, command] = input.split(' ');

    if (truckIdStr === 'EXIT') {
        console.log('Stopping simulation...');
        rl.close();
        return;
    }

    const truckId = parseInt(truckIdStr);

    if (!trucks[truckId]) {
        console.log(`❌ No such truck with ID ${truckId}`);
        return;
    }

    if (command.toUpperCase() === 'ON' || command.toUpperCase() === 'OFF') {
        const acState = command.toUpperCase() === 'ON';
        trucks[truckId].postMessage({ acState });
        console.log(`✔️ Truck ${truckId}: AC turned ${command.toUpperCase()}`);
    } else {
        console.log('❌ Invalid command. Use "TRUCK_ID ON", "TRUCK_ID OFF", or "EXIT".');
    }
});