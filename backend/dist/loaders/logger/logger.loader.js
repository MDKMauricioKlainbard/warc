"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
/**
 * Módulo de logging avanzado con Winston.
 * Configura un sistema de logging con salida a consola y archivos rotativos.
 *
 * @module Logger
 */
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
/**
 * Define los colores personalizados para los diferentes niveles de log
 *
 * @description
 * Asigna colores específicos a cada nivel de logging para mejor visualización en consola:
 * - error: rojo
 * - warn: amarillo
 * - info: verde
 * - http: magenta
 * - debug: blanco
 */
winston_1.default.addColors({
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white",
});
/**
 * Formato para los logs de consola
 *
 * @description
 * Combina:
 * - Timestamp con formato YYYY-MM-DD HH:mm:ss
 * - Colorización de todo el mensaje
 * - Estructura personalizada: [timestamp] [nivel]: mensaje
 */
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`));
/**
 * Formato para los logs en archivos
 *
 * @description
 * Similar al formato de consola pero sin colorización para mejor legibilidad en archivos
 */
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`));
/**
 * Transportes configurados para el logger
 *
 * @description
 * Configuración de los diferentes destinos para los logs:
 * 1. Consola: Muestra logs coloreados
 * 2. Archivo rotativo para errores:
 *    - Ruta: server/logs/error-[DATE].log
 *    - Rotación diaria
 *    - Comprimido
 *    - Tamaño máximo 20MB
 *    - Retención 14 días
 * 3. Archivo rotativo para todos los logs:
 *    - Misma configuración que errores pero para todos los niveles
 */
const transports = [
    new winston_1.default.transports.Console({
        format: consoleFormat,
    }),
    new winston_daily_rotate_file_1.default({
        filename: 'server/logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
        format: fileFormat
    }),
    new winston_daily_rotate_file_1.default({
        filename: 'server/logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: fileFormat
    })
];
/**
 * Instancia del logger configurado
 *
 * @description
 * Logger con los transportes configurados y nivel de logging según entorno:
 * - Producción: nivel 'info' (solo logs importantes)
 * - Desarrollo: nivel 'silly' (todos los logs)
 */
exports.logger = winston_1.default.createLogger({
    transports: transports,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
});
