"use strict";
exports.__esModule = true;
var worker_threads_1 = require("worker_threads");
function runWorker(truckId, routeFile, walletChoice) {
    var worker = new worker_threads_1.Worker('./workercodigo3.js', {
        workerData: { truckId: truckId, routeFile: routeFile, walletChoice: walletChoice }
    });
    worker.on('message', function (message) {
        console.log(message);
        if (message === '✅ Finished simulation') {
            // Aquí puedes manejar la terminación del worker si lo deseas.
        }
    });
    worker.on('error', function (error) {
        console.error('Worker error:', error);
    });
    worker.on('exit', function (code) {
        if (code !== 0) {
            console.error("Worker stopped with exit code ".concat(code));
        }
    });
    return worker;
}
var rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
var trucks = {};
// Inicializa los workers para cada camión
trucks[1] = runWorker(1, './vehicle001-route.json', 1);
trucks[3] = runWorker(3, './vehicle002-route.json', 3);
rl.on('line', function (input) {
    var _a = input.split(' '), truckIdStr = _a[0], command = _a[1];
    if (truckIdStr === 'EXIT') {
        console.log('Stopping simulation...');
        rl.close();
        return;
    }
    var truckId = parseInt(truckIdStr);
    // Verificar que el truckId sea válido
    if (!trucks[truckId]) {
        console.log("\u274C No such truck with ID ".concat(truckId));
        return;
    }
    if (command.toUpperCase() === 'ON' || command.toUpperCase() === 'OFF') {
        var acState = command.toUpperCase() === 'ON';
        // Enviar el mensaje solo al truck correspondiente
        trucks[truckId].postMessage({ acState: acState });
        console.log("\u2714\uFE0F Truck ".concat(truckId, ": AC turned ").concat(command.toUpperCase()));
    }
    else {
        console.log('❌ Invalid command. Use "TRUCK_ID ON", "TRUCK_ID OFF", or "EXIT".');
    }
});
