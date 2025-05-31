import express, { Express } from "express";
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from 'express-rate-limit';

export const baseMiddlewaresLoader = (app: Express): void => {
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(cors());
    app.use(helmet());
    app.use(morgan("dev"));
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
    }))
    return;
}
