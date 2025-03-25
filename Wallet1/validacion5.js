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
// Obtener el ID del camión desde los argumentos de la línea de comandos
var truckId = process.argv[2];
if (!truckId) {
    console.error('❌ Debes proporcionar el ID del camión como argumento.');
    process.exit(1);
}
require('dotenv').config({ path: "./".concat(truckId, ".env") });
// Configuración del archivo de bloques
var blocksFilePath = path.resolve("./camion".concat(truckId, "_bloques.txt"));
if (!fs.existsSync(blocksFilePath)) {
    console.error("\u274C No se encontr\u00F3 el archivo de bloques para el cami\u00F3n ".concat(truckId, "."));
    process.exit(1);
}
// Configuración del archivo de logs
var logFilePath = path.resolve("./truck_".concat(truckId, "_validations.txt"));
if (fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, ''); // Vaciar el archivo
    console.log("\u2705 Contenido del archivo de validacion del cami\u00F3n ".concat(truckId, " eliminado."));
}
else {
    console.error("\u274C No se encontr\u00F3 el archivo de validacion para el cami\u00F3n ".concat(truckId, "."));
}
// URL del nodo IOTA (debe estar en tu archivo .env)
var NODE_URL = process.env.NODE_URL || 'https://api.testnet.iotaledger.net';
// Inicializar el cliente de la red IOTA
function initializeClient() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new sdk_1.Client({
                    nodes: [NODE_URL],
                    localPow: true
                })];
        });
    });
}
// Inicializar la wallet
function initializeWallet() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new sdk_1.Wallet({
                    storagePath: process.env.WALLET_DB_PATH,
                    clientOptions: { nodes: [NODE_URL] },
                    coinType: 4219,
                    secretManager: {
                        stronghold: {
                            snapshotPath: "./wallet".concat(truckId, ".stronghold"),
                            password: process.env.SH_PASSWORD
                        }
                    }
                })];
        });
    });
}
// Función para obtener los metadatos de un bloque
function getBlockMetadata(blockId) {
    return __awaiter(this, void 0, void 0, function () {
        var client, metadata;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initializeClient()];
                case 1:
                    client = _a.sent();
                    return [4 /*yield*/, client.getBlockMetadata(blockId)];
                case 2:
                    metadata = _a.sent();
                    return [2 /*return*/, metadata];
            }
        });
    });
}
// Función para obtener los detalles de una milestone por su índice
function getMilestoneDetails(milestoneIndex) {
    return __awaiter(this, void 0, void 0, function () {
        var client, milestoneDetails;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initializeClient()];
                case 1:
                    client = _a.sent();
                    return [4 /*yield*/, client.getMilestoneByIndex(milestoneIndex)];
                case 2:
                    milestoneDetails = _a.sent();
                    return [2 /*return*/, milestoneDetails];
            }
        });
    });
}
// Función para calcular el tiempo de validación
function calculateValidationTime(sendTime, milestoneTimestamp) {
    var sendTimestamp = new Date(sendTime).getTime(); // Convertir la hora de envío a timestamp en milisegundos
    var milestoneTimestampMs = milestoneTimestamp * 1000; // Convertir el timestamp de la milestone a milisegundos
    console.log('Hora de envío (ISO):', sendTime);
    console.log('Hora de envío (timestamp):', sendTimestamp);
    console.log('Timestamp de la milestone (segundos):', milestoneTimestamp);
    console.log('Timestamp de la milestone (milisegundos):', milestoneTimestampMs);
    var validationTimeMs = milestoneTimestampMs - sendTimestamp; // Diferencia en milisegundos
    var validationTimeSeconds = validationTimeMs / 1000; // Convertir a segundos
    return validationTimeSeconds; // Devolver el tiempo de validación en segundos
}
// Función para escribir en el archivo de logs
function logValidation(message) {
    fs.writeFileSync(logFilePath, "".concat(new Date().toISOString(), " - ").concat(message, "\n"), { flag: 'a' });
}
// Procesar los bloques
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var wallet, client, blocks, _i, blocks_1, blockLine, _a, blockId, sendTime, isBlockConfirmed, startTime, maxValidationTime, blockMetadata, milestoneIndex, milestoneDetails, milestoneTimestamp, validationTime, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, initializeWallet()];
            case 1:
                wallet = _b.sent();
                return [4 /*yield*/, initializeClient()];
            case 2:
                client = _b.sent();
                blocks = fs.readFileSync(blocksFilePath, 'utf8').split('\n').filter(Boolean);
                _i = 0, blocks_1 = blocks;
                _b.label = 3;
            case 3:
                if (!(_i < blocks_1.length)) return [3 /*break*/, 16];
                blockLine = blocks_1[_i];
                _a = blockLine.split(','), blockId = _a[0], sendTime = _a[1];
                isBlockConfirmed = false;
                startTime = Date.now();
                maxValidationTime = 600000;
                _b.label = 4;
            case 4:
                if (!(!isBlockConfirmed && Date.now() - startTime < maxValidationTime)) return [3 /*break*/, 14];
                _b.label = 5;
            case 5:
                _b.trys.push([5, 11, , 13]);
                console.log("\uD83D\uDD0D Validando bloque ".concat(blockId, "..."));
                return [4 /*yield*/, getBlockMetadata(blockId)];
            case 6:
                blockMetadata = _b.sent();
                if (!(blockMetadata && blockMetadata.blockId && blockMetadata.referencedByMilestoneIndex)) return [3 /*break*/, 8];
                milestoneIndex = blockMetadata.referencedByMilestoneIndex;
                return [4 /*yield*/, getMilestoneDetails(milestoneIndex)];
            case 7:
                milestoneDetails = _b.sent();
                if (milestoneDetails && milestoneDetails.timestamp) {
                    milestoneTimestamp = milestoneDetails.timestamp;
                    validationTime = calculateValidationTime(sendTime, milestoneTimestamp);
                    console.log("\u2705 Bloque ".concat(blockId, " validado en ").concat(validationTime, " segundos por la milestone ").concat(milestoneIndex, "."));
                    logValidation("\u2705 Cami\u00F3n ".concat(truckId, ": Bloque ").concat(blockId, " validado en ").concat(validationTime, " segundos por la milestone ").concat(milestoneIndex, "."));
                    isBlockConfirmed = true; // El bloque está confirmado, salir del bucle
                }
                else {
                    console.error("\u274C No se pudieron obtener los detalles de la milestone ".concat(milestoneIndex, "."));
                    logValidation("\u274C No se pudieron obtener los detalles de la milestone ".concat(milestoneIndex, "."));
                }
                return [3 /*break*/, 10];
            case 8:
                // El bloque no está confirmado, esperar 1 segundo antes de reintentar
                console.log("\u26A0\uFE0F Bloque ".concat(blockId, " a\u00FAn no ha sido confirmado. Reintentando en 1 segundo..."));
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
            case 9:
                _b.sent();
                _b.label = 10;
            case 10: return [3 /*break*/, 13];
            case 11:
                error_1 = _b.sent();
                // Si hay un error, esperar 1 segundo antes de reintentar
                console.error("\u274C Error validando bloque ".concat(blockId, ": ").concat(error_1, ". Reintentando en 1 segundo..."));
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
            case 12:
                _b.sent();
                return [3 /*break*/, 13];
            case 13: return [3 /*break*/, 4];
            case 14:
                if (!isBlockConfirmed) {
                    console.error("\u274C El bloque ".concat(blockId, " no se ha confirmado despu\u00E9s de 10 minutos."));
                    logValidation("\u274C El bloque ".concat(blockId, " no se ha confirmado despu\u00E9s de 10 minutos."));
                }
                _b.label = 15;
            case 15:
                _i++;
                return [3 /*break*/, 3];
            case 16: 
            // Cerrar la wallet y el cliente
            return [4 /*yield*/, wallet.destroy()];
            case 17:
                // Cerrar la wallet y el cliente
                _b.sent();
                console.log('✅ Validación completada.');
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); })();
