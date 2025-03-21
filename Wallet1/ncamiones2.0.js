"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var sdk_1 = require("@iota/sdk");
var fs = require("fs");
var path = require("path");
var readline = require("readline");
require('dotenv').config({ path: './4.env' }); // Asegúrate de cargar el archivo .env4
// Función para convertir una cadena UTF-8 a hexadecimal
function utf8ToHex(str) {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}
var walletInstance = null;
var acStates = {}; // Estado del aire acondicionado por camión
// Inicializar la wallet usando el archivo .env4
function initializeWallet() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!walletInstance) {
                walletInstance = new sdk_1.Wallet({
                    storagePath: process.env.WALLET_DB_PATH,
                    clientOptions: {
                        nodes: [process.env.NODE_URL]
                    },
                    coinType: 4219,
                    secretManager: {
                        stronghold: {
                            snapshotPath: './wallet4.stronghold',
                            password: process.env.SH_PASSWORD
                        }
                    }
                });
            }
            return [2 /*return*/, walletInstance];
        });
    });
}
// Envía datos a IOTA
function sendToIota(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var wallet, account, address, taggedDataPayload, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initializeWallet()];
                case 1:
                    wallet = _a.sent();
                    return [4 /*yield*/, wallet.getAccount(process.env.ACCOUNT_NAME)];
                case 2:
                    account = _a.sent();
                    return [4 /*yield*/, account.sync()];
                case 3:
                    _a.sent();
                    address = 'tst1qzxynkw7zxesjr2x50mre25dtva03tpgrwwtnfrmqcakwft7pd09jlj979x';
                    taggedDataPayload = {
                        type: sdk_1.PayloadType.TaggedData,
                        tag: utf8ToHex('/ul/iot1234/device001/attrs'),
                        data: utf8ToHex(payload),
                        getType: function () { return sdk_1.PayloadType.TaggedData; }
                    };
                    return [4 /*yield*/, account.send(BigInt(50600), address, { taggedDataPayload: taggedDataPayload })];
                case 4:
                    response = _a.sent();
                    console.log("Block sent: ".concat(process.env.EXPLORER_URL, "/block/").concat(response.blockId));
                    return [2 /*return*/];
            }
        });
    });
}
// Simula el camión
function simulateTruck(routeFile, truckId) {
    return __awaiter(this, void 0, void 0, function () {
        var route, temperature, i, point, payload, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    route = loadRoute(routeFile);
                    temperature = 20.0;
                    console.log("Truck ".concat(truckId, " started simulation"));
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < route.length)) return [3 /*break*/, 8];
                    point = route[i];
                    // Verifica que las coordenadas existan
                    if (!point || point.length < 2) {
                        console.error("Truck ".concat(truckId, ": Invalid GPS point:"), point);
                        return [3 /*break*/, 7];
                    }
                    payload = "truck|".concat(truckId, "|t|").concat(temperature.toFixed(1), "|ac|").concat(acStates[truckId] ? 'on' : 'off', "|gps|").concat(point[1], ",").concat(point[0]);
                    console.log("Truck ".concat(truckId, ": Sending data: ").concat(payload));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, sendToIota(payload)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("Truck ".concat(truckId, ": Error sending to IOTA:"), error_1);
                    return [3 /*break*/, 8]; // Detén el ciclo si hay un error
                case 5:
                    // Actualizar la temperatura
                    if (acStates[truckId]) {
                        temperature -= Math.random() * 0.5; // Si el aire está encendido, baja la temperatura
                    }
                    else {
                        temperature += Math.random() * 0.5; // Si el aire está apagado, sube la temperatura
                    }
                    temperature = Math.max(15, Math.min(temperature, 30));
                    // Esperar 1 segundo antes de enviar el siguiente punto
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 6:
                    // Esperar 1 segundo antes de enviar el siguiente punto
                    _a.sent();
                    _a.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 1];
                case 8:
                    console.log("Truck ".concat(truckId, " finished simulation"));
                    return [2 /*return*/];
            }
        });
    });
}
// Lee la ruta desde un archivo JSON
function loadRoute(routeFile) {
    var filePath = path.resolve(routeFile);
    try {
        var data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Error loading route file:', error);
        return [];
    }
}
// Configura el sistema de entrada para cambiar el estado del AC
function setupUserInput() {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    console.log('Commands: TRUCK_ID ON (turn AC on), TRUCK_ID OFF (turn AC off), EXIT (stop simulation)');
    rl.on('line', function (input) {
        var _a = input.trim().split(' '), truckIdStr = _a[0], command = _a[1];
        var truckId = parseInt(truckIdStr, 10);
        if (isNaN(truckId)) {
            console.log('Invalid truck ID. Use the format: TRUCK_ID ON/OFF');
            return;
        }
        if ((command === null || command === void 0 ? void 0 : command.toUpperCase()) === 'ON') {
            acStates[truckId] = true;
            console.log("Truck ".concat(truckId, ": AC turned ON"));
        }
        else if ((command === null || command === void 0 ? void 0 : command.toUpperCase()) === 'OFF') {
            acStates[truckId] = false;
            console.log("Truck ".concat(truckId, ": AC turned OFF"));
        }
        else if ((command === null || command === void 0 ? void 0 : command.toUpperCase()) === 'EXIT') {
            console.log('Exiting simulation...');
            rl.close();
            process.exit(0);
        }
        else {
            console.log('Invalid command. Use "TRUCK_ID ON", "TRUCK_ID OFF", or "EXIT".');
        }
    });
}
// Lanza múltiples camiones con un intervalo de 5 segundos
function launchTrucks(routeFile, numTrucks, interval) {
    return __awaiter(this, void 0, void 0, function () {
        var truckPromises, _loop_1, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truckPromises = [];
                    _loop_1 = function (i) {
                        // Lanza cada camión después de un intervalo
                        truckPromises.push(new Promise(function (resolve) {
                            setTimeout(function () {
                                simulateTruck(routeFile, i + 1).then(function () {
                                    console.log("Truck ".concat(i + 1, " finished simulation"));
                                    resolve();
                                })["catch"](function (err) {
                                    console.error("Error in Truck ".concat(i + 1, ":"), err);
                                    resolve();
                                });
                            }, i * interval); // Multiplicamos el índice del camión por el intervalo (5 segundos)
                        }));
                    };
                    for (i = 0; i < numTrucks; i++) {
                        _loop_1(i);
                    }
                    // Esperar que todas las simulaciones se terminen
                    return [4 /*yield*/, Promise.all(truckPromises)];
                case 1:
                    // Esperar que todas las simulaciones se terminen
                    _a.sent();
                    console.log('All trucks have finished the simulation');
                    process.exit(0); // Finalizar el proceso después de que todos los camiones hayan terminado
                    return [2 /*return*/];
            }
        });
    });
}
// Ejecuta la simulación con un intervalo de 5 segundos
var routeFile = './vehicle001-route.json';
setupUserInput();
launchTrucks(routeFile, 1, 5000)["catch"](function (err) { return console.error('Error:', err); }); // 2 camiones con 5 segundos de intervalo
