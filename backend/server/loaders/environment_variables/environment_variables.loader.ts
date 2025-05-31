/**
 * Módulo para la carga y gestión de variables de entorno
 * 
 * @module EnvironmentLoader
 */
import dotenv from "dotenv";
import { Logger } from "winston";

/**
 * Carga las variables de entorno según el ambiente de ejecución
 * 
 * @param {Logger} logger - Instancia del logger para registrar eventos
 * @returns {void}
 * 
 * @description
 * Esta función realiza las siguientes operaciones:
 * 1. Detecta el ambiente de ejecución (NODE_ENV)
 * 2. En ambientes distintos a producción, carga las variables desde archivo .env
 * 3. Maneja errores en la carga del archivo .env
 * 4. Registra todos los eventos importantes mediante el logger
 * 
 * @example
 * // Uso básico
 * import { logger } from '../utilities/logger';
 * loadEnvironmentVariables(logger);
 */
export const loadEnvironmentVariables = (logger: Logger): void => {
    // Obtenemos el ambiente de ejecución
    const environment = process.env.NODE_ENV;

    // Solo cargamos el archivo .env en ambientes que no sean producción
    if (environment !== "production") {
        // Intentamos cargar el archivo .env
        const result = dotenv.config();

        // Manejo de errores en la carga
        if (result.error) {
            logger.error(
                "Error al cargar el archivo .env: ",
                result.error,
                `Verificar el entorno: ${environment}`
            );
            process.exit(1);
        } else {
            logger.info("Se han cargado las variables de entorno.");
        }
    }

    return;
};