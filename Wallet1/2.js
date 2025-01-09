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
// Lee la ruta desde un archivo JSON
function loadRoute(routeFile) {
    var filePath = path.resolve(routeFile);
    var data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}
// Envía datos a IOTA
function sendToIota(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var wallet, account, address, taggedDataPayload, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wallet = new sdk_1.Wallet({
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
                    return [4 /*yield*/, wallet.getAccount(process.env.ACCOUNT_NAME)];
                case 1:
                    account = _a.sent();
                    return [4 /*yield*/, account.sync()];
                case 2:
                    _a.sent();
                    address = 'rms1qr69y65kxmcxy0dxjh6f8at8vqc270g37a9ku5ewkk72q5gwgt83x3lwj8j';
                    taggedDataPayload = {
                        type: sdk_1.PayloadType.TaggedData,
                        tag: utf8ToHex('/ul/iot1234/device001/attrs'),
                        data: utf8ToHex(payload),
                        getType: function () { return sdk_1.PayloadType.TaggedData; }
                    };
                    return [4 /*yield*/, account.send(BigInt(1000000), address, { taggedDataPayload: taggedDataPayload })];
                case 3:
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
        var route, temperature, acState, _i, route_1, point, payload;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    route = loadRoute(routeFile);
                    temperature = 20.0;
                    acState = false;
                    _i = 0, route_1 = route;
                    _a.label = 1;
                case 1:
                    if (!(_i < route_1.length)) return [3 /*break*/, 5];
                    point = route_1[_i];
                    // Alternar estado del aire acondicionado cada 10 puntos
                    if (route.indexOf(point) % 10 === 0) {
                        acState = !acState;
                    }
                    payload = "t|".concat(temperature.toFixed(1), "|ac|").concat(acState ? 'on' : 'off', "|gps|").concat(point.lng, ",").concat(point.lat);
                    console.log("Sending data: ".concat(payload));
                    return [4 /*yield*/, sendToIota(payload)];
                case 2:
                    _a.sent();
                    // Actualizar temperatura
                    temperature += Math.random() * 2 - 1; // Simula un cambio aleatorio
                    temperature = Math.max(15, Math.min(temperature, 30)); // Límite entre 15 y 30 °C
                    // Espera 1 segundo antes de enviar el siguiente punto
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 30000); })];
                case 3:
                    // Espera 1 segundo antes de enviar el siguiente punto
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Ejecuta la simulación
var routeFile = './vehicle001-route.json'; // Ruta del archivo JSON
simulateTruck(routeFile)["catch"](function (err) { return console.error('Error:', err); });
