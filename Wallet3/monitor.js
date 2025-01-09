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
var mqtt = require("mqtt");
var mongodb_1 = require("mongodb");
var buffer_1 = require("buffer");
require('dotenv').config({ path: '.env' });
// Configurar los logs 
(0, sdk_1.initLogger)();
// Función para introducir retraso entre comprobaciones
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
// Función para convertir hexadecimal a string UTF-8
function hexToUtf8(hex) {
    var hexStr = hex.startsWith('0x') ? hex.slice(2) : hex;
    return buffer_1.Buffer.from(hexStr, 'hex').toString('utf8');
}
// Función para convertir string UTF-8 a hexadecimal
function utf8ToHex(str) {
    return '0x' + buffer_1.Buffer.from(str, 'utf8').toString('hex');
}
// Configuración de MQTT
var mqttClient = mqtt.connect('mqtt://localhost:1883'); // Conecta a Mosquitto 
// Configuración de MongoDB
var mongoClient = new mongodb_1.MongoClient(process.env.MONGODB_URI);
var dbName = process.env.MONGODB_DB_NAME;
// Evento que se ejecuta cuando se establece la conexión MQTT
mqttClient.on('connect', function () {
    console.log('Conectado al broker MQTT');
    mqttClient.subscribe('/+/+/cmd', function (err) {
        if (err) {
            console.error('Error al suscribirse al tópico:', err);
        }
        else {
            console.log('Suscrito al tópico: /+/+/cmd');
        }
    });
});
// Evento que se ejecuta cuando hay un error en la conexión MQTT
mqttClient.on('error', function (error) {
    console.error('Error al conectar a Mosquitto:', error);
});
// Variables para la billetera y la cuenta IOTA
var wallet = null;
var account;
// Función para inicializar la billetera
function initializeWallet() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, envVar, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (wallet) {
                        return [2 /*return*/]; // Si la billetera ya está inicializada, no hacer nada
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    // Verificar que todas las variables de entorno necesarias estén definidas
                    for (_i = 0, _a = ['SH_PASSWORD', 'WALLET_DB_PATH', 'EXPLORER_URL', 'NODE_URL']; _i < _a.length; _i++) {
                        envVar = _a[_i];
                        if (!(envVar in process.env)) {
                            throw new Error(".env ".concat(envVar, " is not defined"));
                        }
                    }
                    // Inicializa la billetera con la configuración especificada
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
                    // Obtener la cuenta y sincronizarla
                    account = _b.sent();
                    return [4 /*yield*/, account.sync()];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, wallet.setStrongholdPassword(process.env.SH_PASSWORD)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _b.sent();
                    console.error('Error inicializando la billetera:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Función para enviar una transacción desde la billetera
function sendTransaction(destinationAddress, tag, data) {
    return __awaiter(this, void 0, void 0, function () {
        var amount, taggedDataPayload, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!wallet || !account) {
                        console.error('La billetera no está inicializada');
                        return [2 /*return*/]; // No hacer nada si la billetera no está inicializada
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    amount = BigInt(100000);
                    taggedDataPayload = {
                        type: sdk_1.PayloadType.TaggedData,
                        tag: utf8ToHex(tag),
                        data: utf8ToHex(data),
                        getType: function () { return sdk_1.PayloadType.TaggedData; }
                    };
                    return [4 /*yield*/, account.send(amount, destinationAddress, { taggedDataPayload: taggedDataPayload })];
                case 2:
                    response = _a.sent();
                    // Mostrar el ID del bloque de la transacción en el explorador
                    console.log("Transacci\u00F3n enviada: ".concat(process.env.EXPLORER_URL, "/block/").concat(response.blockId));
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error enviando la transacción:', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Función principal para monitorear la billetera
function monitorWallet() {
    return __awaiter(this, void 0, void 0, function () {
        var knownTransactionIds, initialTransactions, incomingTransactions, newTransactions, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initializeWallet()];
                case 1:
                    _a.sent(); // Inicializar la billetera
                    if (!wallet || !account) {
                        throw new Error('La billetera no está inicializada correctamente.');
                    }
                    knownTransactionIds = new Set();
                    // Cargar transacciones existentes una sola vez al inicio para evitar mostrarlas como nuevas
                    return [4 /*yield*/, account.sync({ syncIncomingTransactions: true })];
                case 2:
                    // Cargar transacciones existentes una sola vez al inicio para evitar mostrarlas como nuevas
                    _a.sent();
                    return [4 /*yield*/, account.incomingTransactions()];
                case 3:
                    initialTransactions = _a.sent();
                    initialTransactions.forEach(function (tx) { return knownTransactionIds.add(tx.transactionId); });
                    _a.label = 4;
                case 4:
                    if (!true) return [3 /*break*/, 12];
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 9, , 11]);
                    return [4 /*yield*/, account.sync({ syncIncomingTransactions: true })];
                case 6:
                    _a.sent(); // Sincronizar la cuenta
                    return [4 /*yield*/, account.incomingTransactions()];
                case 7:
                    incomingTransactions = _a.sent();
                    newTransactions = incomingTransactions.filter(function (tx) { return !knownTransactionIds.has(tx.transactionId); });
                    if (newTransactions.length > 0) {
                        console.log('Transacciones entrantes nuevas:');
                        newTransactions.forEach(function (tx) {
                            console.log("ID de transacci\u00F3n: ".concat(tx.transactionId));
                            knownTransactionIds.add(tx.transactionId); // Agregar al conjunto de conocidas
                            // Verificar si es un TaggedDataPayload
                            var payload = tx.payload;
                            var essence = payload.essence;
                            if (essence.payload && essence.payload.type === sdk_1.PayloadType.TaggedData) {
                                var taggedDataPayload = essence.payload;
                                var tag = hexToUtf8(taggedDataPayload.tag);
                                var data = hexToUtf8(taggedDataPayload.data);
                                console.log("Tag: ".concat(tag));
                                console.log("Datos: ".concat(data));
                                // Publicar datos en Mosquitto utilizando el tag como tópico
                                var topic_1 = tag; // Utiliza el tag como el tópico
                                var message_1 = data; // Los datos ya están en formato UltraLight 2.0
                                mqttClient.publish(topic_1, message_1, {}, function (err) {
                                    if (err) {
                                        console.error('Error al publicar en Mosquitto:', err);
                                    }
                                    else {
                                        console.log("Datos publicados en Mosquitto en el t\u00F3pico ".concat(topic_1, ": ").concat(message_1));
                                    }
                                });
                            }
                        });
                    }
                    else {
                        console.log('No hay transacciones nuevas en este momento.');
                    }
                    return [4 /*yield*/, delay(5000)];
                case 8:
                    _a.sent(); // Esperar 5 segundos antes de hacer una nueva comprobación
                    return [3 /*break*/, 11];
                case 9:
                    error_3 = _a.sent();
                    console.error('Error al sincronizar la cuenta:', error_3);
                    return [4 /*yield*/, delay(5000)];
                case 10:
                    _a.sent(); // Esperar 5 segundos antes de intentar sincronizar de nuevo
                    return [3 /*break*/, 11];
                case 11: return [3 /*break*/, 4];
                case 12: return [2 /*return*/];
            }
        });
    });
}
// Manejar mensajes MQTT
mqttClient.on('message', function (topic, message) { return __awaiter(void 0, void 0, void 0, function () {
    var command, _a, deviceId, commandPart, topicParts, apikey, deviceIdFromTopic, db, collection, device, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("Mensaje recibido del t\u00F3pico ".concat(topic, ": ").concat(message.toString()));
                command = message.toString();
                _a = command.split('@'), deviceId = _a[0], commandPart = _a[1];
                topicParts = topic.split('/');
                apikey = topicParts[1];
                deviceIdFromTopic = topicParts[2];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 7, 8, 10]);
                return [4 /*yield*/, mongoClient.connect()];
            case 2:
                _b.sent(); // Conectar a MongoDB
                db = mongoClient.db(dbName);
                collection = db.collection('devices');
                return [4 /*yield*/, collection.findOne({ device_id: deviceIdFromTopic, apikey: apikey })];
            case 3:
                device = _b.sent();
                if (!device) return [3 /*break*/, 5];
                console.log("Direcci\u00F3n de wallet para ".concat(deviceIdFromTopic, " (APIKEY: ").concat(apikey, "): ").concat(device.wallet_address));
                return [4 /*yield*/, sendTransaction(device.wallet_address, topic, command)];
            case 4:
                _b.sent(); // Enviar transacción si se encuentra el dispositivo
                return [3 /*break*/, 6];
            case 5:
                console.error("No se encontr\u00F3 la direcci\u00F3n de wallet para ".concat(deviceIdFromTopic, " con APIKEY: ").concat(apikey));
                _b.label = 6;
            case 6: return [3 /*break*/, 10];
            case 7:
                err_1 = _b.sent();
                console.error('Error al conectar con MongoDB:', err_1);
                return [3 /*break*/, 10];
            case 8: return [4 /*yield*/, mongoClient.close()];
            case 9:
                _b.sent(); // Cerrar la conexión a MongoDB
                return [7 /*endfinally*/];
            case 10: return [2 /*return*/];
        }
    });
}); });
// Ejecuta la función de monitoreo
monitorWallet();
