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
var worker_threads_1 = require("worker_threads");
var sdk_1 = require("@iota/sdk");
var fs = require("fs");
var path = require("path");
var truckId = worker_threads_1.workerData.truckId, walletChoice = worker_threads_1.workerData.walletChoice, sentBlocks = worker_threads_1.workerData.sentBlocks;
var isProcessing = false;
if (walletChoice !== 1) {
    require('dotenv').config({ path: "./".concat(walletChoice, ".env") });
}
// Configuración del archivo de logs
var logFilePath = path.resolve("./truck_".concat(truckId, "_validations.txt"));
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
                            snapshotPath: "./wallet".concat(walletChoice, ".stronghold"),
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
        var client;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initializeClient()];
                case 1:
                    client = _a.sent();
                    return [4 /*yield*/, client.getBlockMetadata(blockId)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
// Función para calcular el tiempo de validación
function calculateValidationTime(blockTimestamp, milestoneTimestamp) {
    return milestoneTimestamp - blockTimestamp;
}
// Función para escribir en el archivo de logs
function logValidation(message) {
    fs.writeFileSync(logFilePath, "".concat(new Date().toISOString(), " - ").concat(message, "\n"), { flag: 'a' });
}
// Procesar los bloques
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var wallet, client, _i, sentBlocks_1, blockId, isBlockConfirmed, blockMetadata, validationTime, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isProcessing = true;
                return [4 /*yield*/, initializeWallet()];
            case 1:
                wallet = _a.sent();
                return [4 /*yield*/, initializeClient()];
            case 2:
                client = _a.sent();
                _i = 0, sentBlocks_1 = sentBlocks;
                _a.label = 3;
            case 3:
                if (!(_i < sentBlocks_1.length)) return [3 /*break*/, 14];
                blockId = sentBlocks_1[_i];
                isBlockConfirmed = false;
                _a.label = 4;
            case 4:
                if (!!isBlockConfirmed) return [3 /*break*/, 13];
                _a.label = 5;
            case 5:
                _a.trys.push([5, 10, , 12]);
                return [4 /*yield*/, getBlockMetadata(blockId)];
            case 6:
                blockMetadata = _a.sent();
                if (!((blockMetadata === null || blockMetadata === void 0 ? void 0 : blockMetadata.referencedByMilestoneIndex) && blockMetadata.blockTimestamp && blockMetadata.milestoneTimestamp)) return [3 /*break*/, 7];
                validationTime = calculateValidationTime(blockMetadata.blockTimestamp, blockMetadata.milestoneTimestamp);
                logValidation("\u2705 Cami\u00F3n ".concat(truckId, ": Bloque ").concat(blockId, " validado en ").concat(validationTime, " segundos."));
                isBlockConfirmed = true; // El bloque está confirmado, salir del bucle
                return [3 /*break*/, 9];
            case 7: 
            // El bloque no está confirmado, esperar 1 segundo antes de reintentar
            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
            case 8:
                // El bloque no está confirmado, esperar 1 segundo antes de reintentar
                _a.sent();
                _a.label = 9;
            case 9: return [3 /*break*/, 12];
            case 10:
                error_1 = _a.sent();
                // Si hay un error, esperar 1 segundo antes de reintentar
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
            case 11:
                // Si hay un error, esperar 1 segundo antes de reintentar
                _a.sent();
                return [3 /*break*/, 12];
            case 12: return [3 /*break*/, 4];
            case 13:
                _i++;
                return [3 /*break*/, 3];
            case 14: 
            // Cerrar la wallet y el cliente
            return [4 /*yield*/, wallet.destroy()];
            case 15:
                // Cerrar la wallet y el cliente
                _a.sent();
                isProcessing = false;
                // Finalizar el worker correctamente
                worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({ type: 'validation_finished' });
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); })();
