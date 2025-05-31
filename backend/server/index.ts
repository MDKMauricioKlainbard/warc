import express from "express"
import { baseMiddlewaresLoader } from "@loaders/base_middlewares/base_middlewares.loader";
import { logger } from "@loaders/logger/logger.loader";
import { initDatabase } from "@loaders/init_database/init_database.loader";
import { loadEnvironmentVariables } from "@loaders/environment_variables/environment_variables.loader";
import { routesLoader } from "@loaders/routes/routes.loader";

const app = express();

loadEnvironmentVariables(logger);
baseMiddlewaresLoader(app);
initDatabase(logger);
routesLoader(app)

const PORT = process.env.APP_PORT || 3000;

app.listen(PORT, () => {
    const ENVIRONMENT = process.env.NODE_ENV?.toUpperCase() || "DEVELOPMENT";
    const lineLength = "╠══════════════════════════════════════════════════╣".length;
    const lines = {
        port: `║ Puerto: ${PORT.toString()}` + ' '.repeat(lineLength - `║ Puerto: ${PORT.toString()}`.length - 1) + '║\n',
        environment: `║ Entorno: ${ENVIRONMENT}` + ' '.repeat(lineLength - `║ Entorno: ${ENVIRONMENT}`.length - 1) + '║\n',
        pid: `║ PID: ${process.pid.toString()}` + ' '.repeat(lineLength - `║ PID: ${process.pid.toString()}`.length - 1) + '║\n',
        time: `║ Tiempo: ${new Date().toISOString()}` + ' '.repeat(lineLength - `║ Tiempo: ${new Date().toISOString()}`.length - 1) + '║\n',
    }
    logger.info('\n' +
        '╔══════════════════════════════════════════════════╗\n' +
        '║                SERVIDOR INICIADO                 ║\n' +
        '╠══════════════════════════════════════════════════╣\n' +
        lines.port +
        lines.environment +
        lines.pid +
        lines.time +
        '╚══════════════════════════════════════════════════╝\n' +
        `Servidor listo para aceptar conexiones en: http://localhost:${PORT}`
    );

    return;
})