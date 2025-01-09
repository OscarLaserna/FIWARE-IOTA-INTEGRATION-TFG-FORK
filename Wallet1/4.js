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
require('dotenv').config();
// Función para convertir una cadena UTF-8 a hexadecimal
function utf8ToHex(str) {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}
var walletInstance = null;
// Inicializar la wallet una sola vez
function initializeWallet() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!walletInstance) {
                walletInstance = new sdk_1.Wallet({
                    storagePath: process.env.WALLET_DB_PATH,
                    clientOptions: {
                        nodes: [process.env.NODE_URL]
                    },
                    coinType: sdk_1.CoinType.Shimmer,
                    secretManager: {
                        stronghold: {
                            snapshotPath: './v3.stronghold',
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
                    address = 'rms1qpun0fuekhvjvyhesrnehuvuxq6p2rlwapflg073vtx450ntderdjqjr74w';
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
function simulateTruck(routeFile) {
    return __awaiter(this, void 0, void 0, function () {
        var route, temperature, acState, i, point, payload, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    route = loadRoute(routeFile);
                    temperature = 20.0;
                    acState = false;
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < route.length)) return [3 /*break*/, 8];
                    point = route[i];
                    // Cambiar el estado del aire acondicionado cada 10 puntos
                    if (i % 10 === 0) {
                        acState = !acState;
                    }
                    // Verifica que las coordenadas existan
                    if (!point || point.length < 2) {
                        console.error('Invalid GPS point:', point);
                        return [3 /*break*/, 7];
                    }
                    payload = "t|".concat(temperature.toFixed(1), "|ac|").concat(acState ? 'on' : 'off', "|gps|").concat(point[1], ",").concat(point[0]);
                    console.log("Sending data: ".concat(payload));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, sendToIota(payload)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error sending to IOTA:', error_1);
                    return [3 /*break*/, 8]; // Detén el ciclo si hay un error
                case 5:
                    // Actualizar la temperatura
                    temperature += Math.random() * 2 - 1;
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
                case 8: return [2 /*return*/];
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
// Ejecuta la simulación
var routeFile = './vehicle001-route.json';
simulateTruck(routeFile)["catch"](function (err) { return console.error('Error:', err); });
