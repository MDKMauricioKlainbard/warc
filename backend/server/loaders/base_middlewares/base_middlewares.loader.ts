// archivo: base_middlewares.loader.ts

/**
 * Módulo para cargar los middlewares base de la aplicación.
 * Contiene configuraciones esenciales de seguridad, logging y manejo de requests.
 * 
 * @module BaseMiddlewaresLoader
 */
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from 'express-rate-limit';
import passport from "passport";

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
export const baseMiddlewaresLoader = (app: Express): void => {
    // Middleware para parsear bodies JSON
    app.use(express.json());

    // Middleware para parsear bodies de formularios
    app.use(express.urlencoded({ extended: true }));

    // Habilita CORS (Cross-Origin Resource Sharing)
    app.use(cors());

    // Middleware de seguridad para headers HTTP
    app.use(helmet());

    // Middleware de logging para desarrollo
    app.use(morgan("dev"));

    // Limitador de peticiones (100 cada 15 minutos)
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, // Límite por IP
    }));

    // Inicializa la configuración de passport para autenticación de usuarios.
    app.use(passport.initialize())

    return;
};