"use strict";
// archivo: base_middlewares.loader.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseMiddlewaresLoader = void 0;
/**
 * Módulo para cargar los middlewares base de la aplicación.
 * Contiene configuraciones esenciales de seguridad, logging y manejo de requests.
 *
 * @module BaseMiddlewaresLoader
 */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const passport_1 = __importDefault(require("passport"));
/**
 * Carga los middlewares esenciales en la aplicación Express.
 *
 * @param {Express} app - Instancia de Express a la que se añadirán los middlewares
 * @returns {void}
 *
 * @description
 * Esta función configura los siguientes middlewares:
 * - express.json: Para parsear bodies en formato JSON
 * - express.urlencoded: Para parsear bodies de formularios
 * - cors: Para habilitar CORS
 * - helmet: Para seguridad básica de headers HTTP
 * - morgan: Para logging de requests en desarrollo
 * - rateLimit: Para limitar peticiones y prevenir ataques de fuerza bruta
 * - passport.initialize: Para inicializar la configuración de passport para autenticación de usuarios.
 */
const baseMiddlewaresLoader = (app) => {
    // Middleware para parsear bodies JSON
    app.use(express_1.default.json());
    // Middleware para parsear bodies de formularios
    app.use(express_1.default.urlencoded({ extended: true }));
    // Habilita CORS (Cross-Origin Resource Sharing)
    app.use((0, cors_1.default)());
    // Middleware de seguridad para headers HTTP
    app.use((0, helmet_1.default)());
    // Middleware de logging para desarrollo
    app.use((0, morgan_1.default)("dev"));
    // Limitador de peticiones (100 cada 15 minutos)
    app.use((0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, // Límite por IP
    }));
    // Inicializa la configuración de passport para autenticación de usuarios.
    app.use(passport_1.default.initialize());
    return;
};
exports.baseMiddlewaresLoader = baseMiddlewaresLoader;
