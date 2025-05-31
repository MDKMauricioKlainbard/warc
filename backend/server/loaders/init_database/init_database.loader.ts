/**
 * Módulo para la conexión y gestión de la base de datos MongoDB
 * 
 * @module Database
 */
import mongoose from "mongoose";
import { Logger } from "winston";

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
export const initDatabase = async (logger: Logger): Promise<void> => {
    // Obtenemos la URI de conexión de las variables de entorno
    const MONGO_URI = process.env.MONGO_URI;

    // Validamos que exista la URI de conexión
    if (!MONGO_URI) {
        logger.error("No se ha obtenido un URI de Mongo. Revisa el archivo .env o las variables de entorno de producción");
        process.exit(1);
    };

    try {
        // Intentamos establecer la conexión con MongoDB
        await mongoose.connect(MONGO_URI);

        // Logeamos la conexión exitosa (ocultando credenciales por seguridad)
        logger.info(`La base de datos ha sido conectada a: ${MONGO_URI.split('@')[1]?.split('/')[0] || "uri_oculta"}`);
    }
    catch (error) {
        // Manejamos errores de conexión
        logger.error(`La conexión a la base de datos falló: ${(error as Error).message}`);
        process.exit(1)
    };

    // Configuramos listener para eventos de desconexión
    mongoose.connection.on("disconnected", () => {
        logger.warn("Se ha perdido la conexión con la base de datos.")
    });

    // Configuramos listener para eventos de reconexión
    mongoose.connection.on("reconnected", () => {
        logger.info("Se ha reestablecido la conexión con la base de datos.")
    });

    return;
}