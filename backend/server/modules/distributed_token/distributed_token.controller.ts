import express from "express"
import { generateRandomPoints } from "./distributes_token.service";

export const DistributedTokenController = express.Router();

DistributedTokenController.post('/', async (req, res): Promise<void> => {
    const { totalPoints, polygonCoordinates } = req.body
    try {
        const result = await generateRandomPoints(totalPoints, polygonCoordinates)
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: (error as Error).message })
    }
    return
})

DistributedTokenController.get('/', async(req, res): Promise<void> => {
    res.send("Hola")
})