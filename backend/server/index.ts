import express from "express"
import { baseMiddlewaresLoader } from "@loaders/base_middlewares/base_middlewares.loader";
import { logger } from "@loaders/logger/logger.loader";

const PORT = 3000;
const app = express();

baseMiddlewaresLoader(app);

app.listen(PORT, () => {
    const ENVIRONMENT = process.env.NODE_ENV?.toUpperCase() || "DESARROLLO";
    const lineLength = "╠══════════════════════════════════════════════════╣".length;
    const lines = {
        port: `║ Puerto: ${PORT.toString()}` + ' '.repeat(lineLength - `║ Puerto: ${PORT.toString()}`.length - 1) + '║\n',
        environment: `║ Entorno: ${ENVIRONMENT}` + ' '.repeat(lineLength - `║ Entorno: ${ENVIRONMENT}`.length - 1) + '║\n',
        pid: `║ PID: ${process.pid.toString()}` + ' '.repeat(lineLength - `║ PID: ${process.pid.toString()}`.length - 1) + '║\n',
        time: `║ Tiempo: ${new Date().toISOString()}` + ' '.repeat(lineLength - `║ Tiempo: ${new Date().toISOString()}`.length - 1) + '║\n',
    }
    logger.info('\n' +
        '╔══════════════════════════════════════════════════╗\n' +
        '║                 SERVIDOR INICIADO                ║\n' +
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