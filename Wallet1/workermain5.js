"use strict";
exports.__esModule = true;
var worker_threads_1 = require("worker_threads");
var readline = require("readline");
var fs = require("fs");
var path = require("path");
// Configuración de la interfaz de lectura de consola
var rl = readline.createInterface({ input: process.stdin, output: process.stdout });
var trucks = {};
// Función para iniciar el worker de un camión
function runWorker(truckId, routeFile, walletChoice) {
    // Eliminar el contenido del archivo de bloques antes de iniciar el worker
    var blocksFilePath = path.resolve("./camion".concat(truckId, "_bloques.txt"));
    if (fs.existsSync(blocksFilePath)) {
        fs.writeFileSync(blocksFilePath, ''); // Vaciar el archivo
        console.log("\u2705 Contenido del archivo de bloques del cami\u00F3n ".concat(truckId, " eliminado."));
    }
    else {
        console.error("\u274C No se encontr\u00F3 el archivo de bloques para el cami\u00F3n ".concat(truckId, "."));
    }
    var worker = new worker_threads_1.Worker('./workercodigo5.js', {
        workerData: { truckId: truckId, routeFile: routeFile, walletChoice: walletChoice }
    });
    worker.on('message', function (message) {
        console.log(message);
    });
    worker.on('error', function (error) { return console.error('Worker error:', error); });
    worker.on('exit', function (code) {
        if (code !== 0)
            console.error("Worker stopped with exit code ".concat(code));
    });
    return worker;
}
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
