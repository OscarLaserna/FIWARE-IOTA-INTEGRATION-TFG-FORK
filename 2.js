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
// Importamos las librerías necesarias
var fs = require("fs");
var csv = require("csv-parser");
var mqtt = require("mqtt");
var yargs = require("yargs");
var path = require("path");
// Validar si el archivo existe
function validateFile(filePath) {
    try {
        return fs.existsSync(filePath);
    }
    catch (error) {
        return false;
    }
}
// Validar cada fila del CSV
function validateCsvRow(row) {
    try {
        var deviceId = row[0], apiKey = row[1], statistic1 = row[2], minValue = row[3], maxValue = row[4], statistic2 = row[5], initValue = row[6], routeFile = row[7];
        var min = parseFloat(minValue);
        var max = parseFloat(maxValue);
        var init = parseFloat(initValue);
        if (min >= max)
            throw new Error("min_value debe ser menor que max_value");
        if (!validateFile(routeFile))
            throw new Error("El archivo ".concat(routeFile, " no existe"));
        return true;
    }
    catch (error) {
        console.error("Error validando fila: ".concat(error.message));
        return false;
    }
}
// Función para publicar mensajes MQTT
function mqttPublisher(mqttHost, mqttPort, apiKey, deviceId, statistic1, minValue, maxValue, statistic2, initValue, routeFile) {
    var client = mqtt.connect("mqtt://".concat(mqttHost, ":").concat(mqttPort));
    // Leer las coordenadas del archivo JSON
    var coordinates = JSON.parse(fs.readFileSync(routeFile, 'utf8'));
    var value2 = initValue;
    coordinates.forEach(function (coord, index) {
        setTimeout(function () {
            var value1 = Math.random() * (maxValue - minValue) + minValue;
            var message = "".concat(statistic1, "|").concat(value1, "|").concat(statistic2, "|").concat(value2, "|gps|").concat(coord);
            var topic = "/ul/".concat(apiKey, "/").concat(deviceId, "/attrs");
            console.log("".concat(topic, " -> ").concat(message));
            client.publish(topic, message);
            value2 -= 0.1;
        }, index * 1000);
    });
}
// Programa principal
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var argv, csvFilePath, mqttHost, mqttPort, rows;
        return __generator(this, function (_a) {
            argv = yargs.options({
                f: { type: 'string', demandOption: true, alias: 'file', describe: 'Archivo CSV' },
                h: { type: 'string', "default": 'localhost', alias: 'mqtt_host', describe: 'Host del servidor MQTT' },
                p: { type: 'number', "default": 1883, alias: 'mqtt_port', describe: 'Puerto del servidor MQTT' }
            }).argv;
            csvFilePath = path.resolve(argv.f);
            mqttHost = argv.h;
            mqttPort = argv.p;
            if (!validateFile(csvFilePath)) {
                console.error("Error: El archivo ".concat(csvFilePath, " no existe."));
                return [2 /*return*/];
            }
            rows = [];
            fs.createReadStream(csvFilePath)
                .pipe(csv({ separator: ';' }))
                .on('data', function (row) { return rows.push(Object.values(row)); })
                .on('end', function () {
                rows.forEach(function (row) {
                    if (!validateCsvRow(row)) {
                        console.error("Error: Fila inv\u00E1lida en el CSV: ".concat(row.join(';')));
                        return;
                    }
                    var deviceId = row[0], apiKey = row[1], statistic1 = row[2], minValue = row[3], maxValue = row[4], statistic2 = row[5], initValue = row[6], routeFile = row[7];
                    // Lanzar un thread simulando con setImmediate
                    setImmediate(function () {
                        mqttPublisher(mqttHost, mqttPort, apiKey, deviceId, statistic1, parseFloat(minValue), parseFloat(maxValue), statistic2, parseFloat(initValue), routeFile);
                    });
                });
            })
                .on('error', function (error) {
                console.error("Error leyendo el archivo CSV: ".concat(error.message));
            });
            return [2 /*return*/];
        });
    });
}
main();
