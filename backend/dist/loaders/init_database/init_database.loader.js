"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = void 0;
/**
 * Módulo para la conexión y gestión de la base de datos MongoDB
 *
 * @module Database
 */
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Inicializa la conexión con la base de datos MongoDB y configura los event listeners
 *
 * @async
 * @param {Logger} logger - Instancia del logger para registrar eventos
 * @returns {Promise<void>} Promesa que se resuelve cuando la conexión está establecida
 *
 * @throws {Error} Si no se encuentra la URI de conexión o falla la conexión
 *
 * @description
 * Esta función realiza las siguientes operaciones:
 * 1. Verifica que exista la variable de entorno MONGO_URI
 * 2. Intenta establecer la conexión con MongoDB
 * 3. Configura listeners para eventos de conexión/desconexión
 * 4. Registra todos los eventos importantes mediante el logger
 *
 * @example
 * // Uso básico
 * import { logger } from '../utilities/logger';
 * await initDatabase(logger);
 */
const initDatabase = async (logger) => {
    // Obtenemos la URI de conexión de las variables de entorno
    const MONGO_URI = process.env.MONGO_URI;
    // Validamos que exista la URI de conexión
    if (!MONGO_URI) {
        logger.error("No se ha obtenido un URI de Mongo. Revisa el archivo .env o las variables de entorno de producción");
        process.exit(1);
    }
    ;
    try {
        // Intentamos establecer la conexión con MongoDB
        await mongoose_1.default.connect(MONGO_URI);
        // Logeamos la conexión exitosa (ocultando credenciales por seguridad)
        logger.info(`La base de datos ha sido conectada a: ${MONGO_URI.split('@')[1]?.split('/')[0] || "uri_oculta"}`);
    }
    catch (error) {
        // Manejamos errores de conexión
        logger.error(`La conexión a la base de datos falló: ${error.message}`);
        process.exit(1);
    }
    ;
    // Configuramos listener para eventos de desconexión
    mongoose_1.default.connection.on("disconnected", () => {
        logger.warn("Se ha perdido la conexión con la base de datos.");
    });
    // Configuramos listener para eventos de reconexión
    mongoose_1.default.connection.on("reconnected", () => {
        logger.info("Se ha reestablecido la conexión con la base de datos.");
    });
    return;
};
exports.initDatabase = initDatabase;
