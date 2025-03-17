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
var fs = require('fs');
var path = require('path');
var NUM_WALLETS = 10;
function updateEnvFile(envFilePath, key, value) {
    var envContent = '';
    if (fs.existsSync(envFilePath)) {
        envContent = fs.readFileSync(envFilePath, 'utf8');
    }
    var envLines = envContent.split('\n');
    var updated = false;
    var newEnvLines = envLines.map(function (line) {
        if (line.startsWith("".concat(key, "="))) {
            updated = true;
            return "".concat(key, "=").concat(value);
        }
        return line;
    });
    if (!updated) {
        newEnvLines.push("".concat(key, "=").concat(value));
    }
    fs.writeFileSync(envFilePath, newEnvLines.join('\n'), 'utf8');
    console.log("\uD83D\uDCC1 Archivo .env actualizado: ".concat(key, "=").concat(value));
}
function setupWallet(walletNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var envFilePath, password, mnemonic, accountName, storagePath, strongholdPath, accountManagerOptions, manager, account, addresses, walletAddress, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    envFilePath = path.resolve(__dirname, "".concat(walletNumber, ".env"));
                    if (!fs.existsSync(envFilePath)) {
                        console.error("\u274C Archivo ".concat(walletNumber, ".env no encontrado."));
                        return [2 /*return*/];
                    }
                    require('dotenv').config({ path: walletNumber !== 1 ? "./".concat(walletNumber, ".env") : './.env', override: true });
                    password = process.env.SH_PASSWORD;
                    mnemonic = process.env.MNEMONIC;
                    accountName = process.env.ACCOUNT_NAME;
                    if (!mnemonic || !password || !accountName) {
                        console.error("\u26A0\uFE0F Faltan variables en ".concat(walletNumber, ".env"));
                        return [2 /*return*/];
                    }
                    storagePath = path.resolve(__dirname, "".concat(accountName, "-database"));
                    strongholdPath = path.resolve(__dirname, "wallet".concat(walletNumber, ".stronghold"));
                    if (fs.existsSync(storagePath)) {
                        fs.rmSync(storagePath, { recursive: true, force: true });
                        console.log("\uD83D\uDDD1\uFE0F Base de datos eliminada: ".concat(storagePath));
                    }
                    if (fs.existsSync(strongholdPath)) {
                        fs.unlinkSync(strongholdPath);
                        console.log("\uD83D\uDDD1\uFE0F Archivo Stronghold eliminado: wallet".concat(walletNumber, ".stronghold"));
                    }
                    accountManagerOptions = {
                        storagePath: storagePath,
                        clientOptions: {
                            nodes: [nodeURL],
                            localPow: true
                        },
                        coinType: CoinType.Shimmer,
                        secretManager: {
                            Stronghold: {
                                snapshotPath: strongholdPath,
                                password: password
                            }
                        }
                    };
                    manager = new AccountManager(accountManagerOptions);
                    return [4 /*yield*/, manager.storeMnemonic(mnemonic)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, manager.createAccount({ alias: accountName })];
                case 2:
                    account = _a.sent();
                    console.log("\u2705 Wallet".concat(walletNumber, " creada con \u00E9xito."));
                    console.log("".concat(accountName, "'s Account:"), account);
                    return [4 /*yield*/, account.sync()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, account.addresses()];
                case 4:
                    addresses = _a.sent();
                    if (addresses.length > 0) {
                        walletAddress = addresses[0].address;
                        console.log("".concat(accountName, "'s Address: ").concat(walletAddress));
                        updateEnvFile(envFilePath, 'WALLET_ADDRESS', walletAddress);
                    }
                    else {
                        console.error("\u274C No se encontraron direcciones para Wallet".concat(walletNumber));
                    }
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error("\u274C Error en Wallet".concat(walletNumber, ":"), error_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function setupAllWallets() {
    return __awaiter(this, void 0, void 0, function () {
        var i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 5;
                    _a.label = 1;
                case 1:
                    if (!(i <= NUM_WALLETS)) return [3 /*break*/, 4];
                    return [4 /*yield*/, setupWallet(i)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log('🎉 Todas las wallets han sido configuradas.');
                    return [2 /*return*/];
            }
        });
    });
}
setupAllWallets().then(function () { return process.exit(0); });
