"use strict";
exports.__esModule = true;
var worker_threads_1 = require("worker_threads");
var path = require("path");
var NUM_TRUCKS = 2;
var ROUTE_FILE = './vehicle001-route.json';
var _loop_1 = function (truckId) {
    var walletChoice = truckId % 2 === 0 ? 1 : 3; // Alterna entre Wallet1 y Wallet3
    var worker = new worker_threads_1.Worker(path.resolve(__dirname, 'workercodigo.js'), {
        workerData: { truckId: truckId, routeFile: ROUTE_FILE, walletChoice: walletChoice }
    });
    worker.on('message', function (msg) { return console.log("\uD83D\uDE9B Truck ".concat(truckId, ":"), msg); });
    worker.on('error', function (err) { return console.error("\u274C Error in Truck ".concat(truckId, ":"), err); });
    worker.on('exit', function (code) {
        if (code !== 0) {
            console.error("\u26A0\uFE0F Truck ".concat(truckId, " stopped with exit code ").concat(code));
        }
    });
};
for (var truckId = 1; truckId <= NUM_TRUCKS; truckId++) {
    _loop_1(truckId);
}
