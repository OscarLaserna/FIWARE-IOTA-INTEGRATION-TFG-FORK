"use strict";
exports.__esModule = true;
var worker_threads_1 = require("worker_threads");
var readline = require("readline");
// Mantenemos un registro de colas de validación por camión
var validationQueues = {};
var validationWorkers = {};
// Función para iniciar el worker de un camión
function runWorker(truckId, routeFile, walletChoice) {
    var worker = new worker_threads_1.Worker('./workercodigo4.js', {
        workerData: { truckId: truckId, routeFile: routeFile, walletChoice: walletChoice }
    });
    // Inicializar cola y worker de validación para este camión
    if (!validationQueues[truckId]) {
        validationQueues[truckId] = [];
    }
    worker.on('message', function (message) {
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
    worker.on('error', function (error) { return console.error('Worker error:', error); });
    worker.on('exit', function (code) {
        if (code !== 0)
            console.error("Worker stopped with exit code ".concat(code));
    });
    return worker;
}
// Función para iniciar el worker de validación
function startValidationWorker(truckId, walletChoice, sentBlocks) {
    var worker = new worker_threads_1.Worker('./workervalidacion4.js', {
        workerData: { truckId: truckId, walletChoice: walletChoice, sentBlocks: sentBlocks }
    });
    worker.on('message', function (message) { return console.log(message); });
    worker.on('error', function (error) { return console.error('Validator error:', error); });
    worker.on('exit', function (code) {
        if (code !== 0)
            console.error("Validator stopped with exit code ".concat(code));
    });
}
// Configuración de la interfaz de lectura de consola
var rl = readline.createInterface({ input: process.stdin, output: process.stdout });
var trucks = {};
// Inicializar camiones
trucks[5] = runWorker(5, './vehicle001-route.json', 5);
// trucks[6] = runWorker(6, './vehicle002-route.json', 6);
// Escuchar comandos de la consola
rl.on('line', function (input) {
    var _a = input.split(' '), truckIdStr = _a[0], command = _a[1];
    if (truckIdStr === 'EXIT') {
        console.log('Stopping simulation...');
        rl.close();
        return;
    }
    var truckId = parseInt(truckIdStr);
    if (!trucks[truckId]) {
        console.log("\u274C No such truck with ID ".concat(truckId));
        return;
    }
    if (command.toUpperCase() === 'ON' || command.toUpperCase() === 'OFF') {
        var acState = command.toUpperCase() === 'ON';
        trucks[truckId].postMessage({ acState: acState });
        console.log("\u2714\uFE0F Truck ".concat(truckId, ": AC turned ").concat(command.toUpperCase()));
    }
    else {
        console.log('❌ Invalid command. Use "TRUCK_ID ON", "TRUCK_ID OFF", or "EXIT".');
    }
});
