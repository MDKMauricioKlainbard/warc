"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const base_middlewares_loader_1 = require("./loaders/base_middlewares/base_middlewares.loader");
const logger_loader_1 = require("./loaders/logger/logger.loader");
const init_database_loader_1 = require("./loaders/init_database/init_database.loader");
const environment_variables_loader_1 = require("./loaders/environment_variables/environment_variables.loader");
const routes_loader_1 = require("./loaders/routes/routes.loader");
const swagger_1 = require("./docs/swagger");
const passport_config_1 = require("./config/passport.config");
const wallet_config_1 = require("./config/wallet.config");
const app = (0, express_1.default)();
(0, environment_variables_loader_1.loadEnvironmentVariables)(logger_loader_1.logger);
(0, base_middlewares_loader_1.baseMiddlewaresLoader)(app);
(0, init_database_loader_1.initDatabase)(logger_loader_1.logger);
(0, routes_loader_1.routesLoader)(app);
(0, passport_config_1.initializePassportStrategies)(logger_loader_1.logger);
wallet_config_1.wallet.initializeWallet(logger_loader_1.logger);
(0, swagger_1.swaggerDocs)(app);
const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => {
    const ENVIRONMENT = process.env.NODE_ENV?.toUpperCase() || "DEVELOPMENT";
    const lineLength = "╠══════════════════════════════════════════════════╣".length;
    const lines = {
        port: `║ Puerto: ${PORT.toString()}` + ' '.repeat(lineLength - `║ Puerto: ${PORT.toString()}`.length - 1) + '║\n',
        environment: `║ Entorno: ${ENVIRONMENT}` + ' '.repeat(lineLength - `║ Entorno: ${ENVIRONMENT}`.length - 1) + '║\n',
        pid: `║ PID: ${process.pid.toString()}` + ' '.repeat(lineLength - `║ PID: ${process.pid.toString()}`.length - 1) + '║\n',
        time: `║ Tiempo: ${new Date().toISOString()}` + ' '.repeat(lineLength - `║ Tiempo: ${new Date().toISOString()}`.length - 1) + '║\n',
    };
    logger_loader_1.logger.info('\n' +
        '╔══════════════════════════════════════════════════╗\n' +
        '║                SERVIDOR INICIADO                 ║\n' +
        '╠══════════════════════════════════════════════════╣\n' +
        lines.port +
        lines.environment +
        lines.pid +
        lines.time +
        '╚══════════════════════════════════════════════════╝\n' +
        `Servidor listo para aceptar conexiones en: http://localhost:${PORT}`);
    return;
});
