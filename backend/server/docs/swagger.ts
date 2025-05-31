import swaggerJSDoc from "swagger-jsdoc"
import { Express } from "express"
import swaggerUi from "swagger-ui-express"
import path from "path"

export const swaggerDocs = (app: Express): void => {
    const swaggerSpec = swaggerJSDoc({
        definition: {
            openapi: "3.0.0",
            info: {
                title: "API WARC",
                version: "1.0.0",
                description: "API de WARC para NerdConf"
            }
        },
        apis: [path.resolve(__dirname, "../modules/**/*.controller.ts")]
    })
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
    return
}