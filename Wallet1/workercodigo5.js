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
var truckId = worker_threads_1.workerData.truckId, routeFile = worker_threads_1.workerData.routeFile, walletChoice = worker_threads_1.workerData.walletChoice;
if (walletChoice !== 1) {
    require('dotenv').config({ path: "./".concat(walletChoice, ".env") });
}
var acState = false;
var temperature = 20.0;
// Archivo para guardar los bloques enviados
var blocksFilePath = path.resolve("./camion".concat(truckId, "_bloques.txt"));
function utf8ToHex(str) {
    return '0x' + Buffer.from(str, 'utf8').toString('hex');
}
function initializeWallet(walletNumber) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new sdk_1.Wallet({
                    storagePath: process.env.WALLET_DB_PATH,
                    clientOptions: { nodes: [process.env.NODE_URL] },
                    coinType: 4219,
                    secretManager: {
                        stronghold: {
                            snapshotPath: "./wallet".concat(walletNumber, ".stronghold"),
                            password: process.env.SH_PASSWORD
                        }
                    }
                })];
        });
    });
}
function sendToIota(wallet, payload) {
    return __awaiter(this, void 0, void 0, function () {
        var account, address, taggedDataPayload, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, wallet.getAccount(process.env.ACCOUNT_NAME)];
                case 1:
                    account = _a.sent();
                    return [4 /*yield*/, account.sync()];
                case 2:
                    _a.sent();
                    address = "tst1qq5cme5jcmxurlvl6p4hy5z4mqx7c4tnakk7jfcm938nepapzq0vs5vwjyd" //process.env.WALLET_ADDRESS!;
                    ;
                    taggedDataPayload = {
                        type: sdk_1.PayloadType.TaggedData,
                        tag: utf8ToHex('/ul/iot1234/truck5/attrs'),
                        data: utf8ToHex(payload),
                        getType: function () { return sdk_1.PayloadType.TaggedData; }
                    };
                    return [4 /*yield*/, account.send(BigInt(50600), address, { taggedDataPayload: taggedDataPayload })];
                case 3:
                    response = _a.sent();
                    if (!response.blockId) {
                        throw new Error('Block ID is undefined');
                    }
                    return [2 /*return*/, response.blockId];
            }
        });
    });
}
function loadRoute(routeFile) {
    var filePath = path.resolve(routeFile);
    try {
        var data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage("\u274C Error loading route file: ".concat(error));
        return [];
    }
}
var route = loadRoute(routeFile);
var wallet;
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var i, point, payload, blockId, sendTime, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, initializeWallet(walletChoice)];
            case 1:
                wallet = _a.sent();
                i = 0;
                _a.label = 2;
            case 2:
                if (!(i < route.length)) return [3 /*break*/, 9];
                point = route[i];
                if (!point || point.length < 2) {
                    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage("\u26A0\uFE0F Invalid GPS point: ".concat(point));
                    return [3 /*break*/, 8];
                }
                payload = "t|".concat(temperature.toFixed(1), "|ac|").concat(acState ? 'on' : 'off', "|gps|").concat(point[1], ",").concat(point[0]);
                worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage("\uD83D\uDE9B Truck ".concat(truckId, ": \uD83D\uDCE1 Sending: ").concat(payload));
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, sendToIota(wallet, payload)];
            case 4:
                blockId = _a.sent();
                sendTime = new Date().toISOString();
                // Guardar el ID del bloque y la hora de envío en el archivo
                fs.appendFileSync(blocksFilePath, "".concat(blockId, ",").concat(sendTime, "\n"), 'utf8');
                worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({ type: 'block_sent', blockId: blockId, sendTime: sendTime });
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage("\u274C Error sending to IOTA: ".concat(error_1));
                return [3 /*break*/, 6];
            case 6:
                temperature += acState ? -Math.random() * 0.5 : Math.random() * 0.5;
                temperature = Math.max(15, Math.min(temperature, 30));
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
            case 7:
                _a.sent();
                _a.label = 8;
            case 8:
                i++;
                return [3 /*break*/, 2];
            case 9:
                worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage("\u2705 Finished simulation");
                // Cerrar la wallet y finalizar el worker
                return [4 /*yield*/, wallet.destroy()];
            case 10:
                // Cerrar la wallet y finalizar el worker
                _a.sent();
                process.exit(0); // Finalizar el worker correctamente
                return [2 /*return*/];
        }
    });
}); })();
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('message', function (message) {
    if (message.acState !== undefined) {
        acState = message.acState;
    }
});
