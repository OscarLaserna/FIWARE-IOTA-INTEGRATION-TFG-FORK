import { Worker } from 'worker_threads';
import * as readline from 'readline';

// Mantenemos un registro de colas de validación por camión
const validationQueues: { [key: number]: string[] } = {};
const validationWorkers: { [key: number]: Worker } = {};

// Función para iniciar el worker de un camión
function runWorker(truckId: number, routeFile: string, walletChoice: number): Worker {
    const worker = new Worker('./workercodigo4.js', {
        workerData: { truckId, routeFile, walletChoice },
    });

    // Inicializar cola y worker de validación para este camión
    if (!validationQueues[truckId]) {
        validationQueues[truckId] = [];
    }

    worker.on('message', (message) => {
        console.log(message);

        // Si se ha enviado un bloque, añadirlo a la cola de validación
        if (typeof message === 'object' && message.type === 'block_sent') {
            validationQueues[truckId].push(message.blockId);
        }

        // Si el camión ha terminado de enviar bloques, iniciar el worker de validación
        if (typeof message === 'object' && message.type === 'blocks_finished') {
            startValidationWorker(truckId, walletChoice, message.sentBlocks);
        }
    });

    worker.on('error', (error) => console.error('Worker error:', error));
    worker.on('exit', (code) => {
        if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
    });

    return worker;
}

// Función para iniciar el worker de validación
function startValidationWorker(truckId: number, walletChoice: number, sentBlocks: string[]): void {
    const worker = new Worker('./workervalidacion4.js', {
        workerData: { truckId, walletChoice, sentBlocks },
    });

    worker.on('message', (message) => console.log(message));
    worker.on('error', (error) => console.error('Validator error:', error));
    worker.on('exit', (code) => {
        if (code !== 0) console.error(`Validator stopped with exit code ${code}`);
    });
}

// Configuración de la interfaz de lectura de consola
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let trucks: { [key: number]: Worker } = {};

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