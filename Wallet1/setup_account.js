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
var _a = require('@iota/wallet'), AccountManager = _a.AccountManager, CoinType = _a.CoinType;
var networkConfig = require('./networkConfig.js');
var nodeURL = networkConfig.node;
// Carga las variables de entorno desde un archivo .env
require('dotenv').config();
var password = process.env.SH_PASSWORD;
var mnemonic = process.env.MNEMONIC;
var accountName = process.env.ACCOUNT_NAME;
// Función asincrónica principal
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var accountManagerOptions, manager, account, address, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    accountManagerOptions = {
                        storagePath: "./".concat(accountName, "-database"),
                        clientOptions: {
                            nodes: [nodeURL],
                            localPow: true
                        },
                        coinType: CoinType.Shimmer,
                        secretManager: {
                            Stronghold: {
                                snapshotPath: "./wallet.stronghold",
                                password: "".concat(password)
                            }
                        }
                    };
                    manager = new AccountManager(accountManagerOptions);
                    // Almacena la mnemónica en el AccountManager
                    return [4 /*yield*/, manager.storeMnemonic(mnemonic)];
                case 1:
                    // Almacena la mnemónica en el AccountManager
                    _a.sent();
                    return [4 /*yield*/, manager.createAccount({
                            alias: accountName
                        })];
                case 2:
                    account = _a.sent();
                    // Imprime la información de la cuenta en la consola
                    console.log("".concat(accountName, "'s account:"));
                    console.log(account, '\n');
                    // Sincroniza la cuenta con la red
                    return [4 /*yield*/, account.sync()];
                case 3:
                    // Sincroniza la cuenta con la red
                    _a.sent();
                    return [4 /*yield*/, account.addresses()];
                case 4:
                    address = _a.sent();
                    // Imprime las direcciones en la consola
                    console.log("".concat(accountName, "'s Address:"));
                    console.log(address, '\n');
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    // Captura y muestra cualquier error que ocurra durante la ejecución
                    console.log('Error: ', error_1);
                    return [3 /*break*/, 6];
                case 6:
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
run();
