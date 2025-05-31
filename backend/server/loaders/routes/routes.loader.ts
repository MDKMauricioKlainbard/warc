import { DistributedTokenController } from "@server/modules/distributed_token/distributed_token.controller";
import { UserController } from "@server/modules/user/user.controller";
import express, { Express } from "express";

export const routesLoader = (app: Express): void => {
    const DistributedTokenRouter = express.Router();
    DistributedTokenRouter.use("/distributed-token", DistributedTokenController)

    const UserRouter = express.Router()
    UserRouter.use("/user", UserController)

    app.use("/api",
        DistributedTokenRouter,
        UserRouter
    )
    
    return;
}