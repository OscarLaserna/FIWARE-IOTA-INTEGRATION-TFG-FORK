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
// Importar las bibliotecas necesarias
var sdk_1 = require("@iota/sdk");
var buffer_1 = require("buffer");
// Carga las variables de entorno desde un archivo .env
require('dotenv').config({ path: '.env' });
// Importa prompt-sync para leer entradas del usuario
var prompt = require('prompt-sync')({ sigint: true });
// Función para convertir una cadena UTF-8 a hexadecimal
function utf8ToHex(str) {
    return '0x' + buffer_1.Buffer.from(str, 'utf8').toString('hex');
}
// Función asincrónica principal
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, envVar, wallet, account, address, amount, payloadValue, payload, taggedDataPayload, response, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    (0, sdk_1.initLogger)();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, , 7]);
                    // Verifica que las variables de entorno necesarias estén definidas
                    for (_i = 0, _a = ['SH_PASSWORD', 'WALLET_DB_PATH', 'EXPLORER_URL', 'NODE_URL']; _i < _a.length; _i++) {
                        envVar = _a[_i];
                        if (!(envVar in process.env)) {
                            throw new Error(".env ".concat(envVar, " is not defined"));
                        }
                    }
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
                    return [4 /*yield*/, wallet.getAccount('Wallet1')];
                case 2:
                    account = _b.sent();
                    // Sincroniza la cuenta con la red
                    return [4 /*yield*/, account.sync()];
                case 3:
                    // Sincroniza la cuenta con la red
                    _b.sent();
                    return [4 /*yield*/, wallet.setStrongholdPassword(process.env.SH_PASSWORD)];
                case 4:
                    _b.sent();
                    address = 'rms1qr69y65kxmcxy0dxjh6f8at8vqc270g37a9ku5ewkk72q5gwgt83x3lwj8j';
                    amount = BigInt(1000000);
                    payloadValue = prompt('Introduce el valor de la temperatura ');
                    payload = "t|".concat(payloadValue);
                    taggedDataPayload = {
                        type: sdk_1.PayloadType.TaggedData,
                        tag: utf8ToHex('/ul/iot1234/device001/attrs'),
                        data: utf8ToHex(payload),
                        getType: function () { return sdk_1.PayloadType.TaggedData; }
                    };
                    return [4 /*yield*/, account.send(amount, address, { taggedDataPayload: taggedDataPayload })];
                case 5:
                    response = _b.sent();
                    // Imprime en la consola el enlace al bloque enviado usando la URL del explorador
                    console.log("Block sent: ".concat(process.env.EXPLORER_URL, "/block/").concat(response.blockId));
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _b.sent();
                    // Captura y muestra cualquier error que ocurra durante la ejecución
                    console.error('Error: ', error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
run().then(function () { return process.exit(); });
