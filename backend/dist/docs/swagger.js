"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerDocs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const swaggerDocs = (app) => {
    const swaggerSpec = (0, swagger_jsdoc_1.default)({
        definition: {
            openapi: "3.0.0",
            info: {
                title: "API WARC",
                version: "1.0.0",
                description: "API de WARC para NerdConf"
            }
        },
        apis: [path_1.default.resolve(__dirname, "../modules/**/*.controller.ts")]
    });
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    return;
};
exports.swaggerDocs = swaggerDocs;
