import { DistributedTokenController } from "@server/modules/distributed_token/distributed_token.controller";
import express, { Express } from "express";

export const routesLoader = (app: Express): void => {
    const DistributedTokenRouter = express.Router();
    DistributedTokenRouter.use("/distributed-token", DistributedTokenController)
    
    app.use("/api", DistributedTokenRouter)
    return;
}