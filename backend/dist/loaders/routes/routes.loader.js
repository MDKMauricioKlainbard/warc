"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesLoader = void 0;
const distributed_token_controller_1 = require("../../modules/distributed_token/distributed_token.controller");
const user_controller_1 = require("../../modules/user/user.controller");
const express_1 = __importDefault(require("express"));
const routesLoader = (app) => {
    const DistributedTokenRouter = express_1.default.Router();
    DistributedTokenRouter.use("/distributed-token", distributed_token_controller_1.DistributedTokenController);
    const UserRouter = express_1.default.Router();
    UserRouter.use("/user", user_controller_1.UserController);
    app.use("/api", DistributedTokenRouter, UserRouter);
    return;
};
exports.routesLoader = routesLoader;
