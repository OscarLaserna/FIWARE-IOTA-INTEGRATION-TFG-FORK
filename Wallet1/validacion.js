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
require('dotenv').config({ path: "./5.env" });
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
                    coinType: 4219,
                    secretManager: {
                        stronghold: {
                            snapshotPath: './wallet5.stronghold',
                            password: process.env.SH_PASSWORD
                        }
                    }
                });
            }
            return [2 /*return*/, walletInstance];
        });
    });
}
// Envía datos a IOTA y mide el tiempo de validación
function sendToIotaAndMeasure(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var wallet, account, address, taggedDataPayload, startTime, response, client, confirmed, blockMetadata, endTime, validationTime;
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
                    address = 'tst1qqhpsrff0vsmc3cj83ccvn7fuzt40kkk500xmuqcfa3es0awc2yk5fqdtev';
                    taggedDataPayload = {
                        type: sdk_1.PayloadType.TaggedData,
                        tag: utf8ToHex('/ul/iot1234/device001/attrs'),
                        data: utf8ToHex(payload),
                        getType: function () { return sdk_1.PayloadType.TaggedData; }
                    };
                    startTime = Date.now();
                    return [4 /*yield*/, account.send(BigInt(50600), address, { taggedDataPayload: taggedDataPayload })];
                case 4:
                    response = _a.sent();
                    console.log("Block sent: ".concat(process.env.EXPLORER_URL, "/block/").concat(response.blockId));
                    return [4 /*yield*/, wallet.getClient()];
                case 5:
                    client = _a.sent();
                    confirmed = false;
                    _a.label = 6;
                case 6:
                    if (!!confirmed) return [3 /*break*/, 11];
                    return [4 /*yield*/, client.getBlockMetadata(response.blockId)];
                case 7:
                    blockMetadata = _a.sent();
                    if (!(blockMetadata && blockMetadata.blockId && blockMetadata.referencedByMilestoneIndex)) return [3 /*break*/, 8];
                    confirmed = true;
                    return [3 /*break*/, 10];
                case 8:
                    console.log("Block not yet confirmed, retrying...");
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 9:
                    _a.sent(); // Espera 1 segundo antes de volver a consultar
                    _a.label = 10;
                case 10: return [3 /*break*/, 6];
                case 11:
                    endTime = Date.now();
                    validationTime = (endTime - startTime) / 1000;
                    console.log("Validation time: ".concat(validationTime, " seconds"));
                    return [2 /*return*/];
            }
        });
    });
}
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var payload, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                payload = "t|18.0|ac|on|gps|10.4,20.8";
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, sendToIotaAndMeasure(payload)];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error('Error:', error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); })();
