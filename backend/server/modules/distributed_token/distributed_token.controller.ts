import express from "express"
import { generateRandomPoints, getAllDistributionPoints } from "./distributes_token.service";

export const DistributedTokenController = express.Router();

DistributedTokenController.post('/in-polygon', async (req, res): Promise<void> => {
    const { totalPoints, polygonCoordinates } = req.body
    try {
        const result = await generateRandomPoints(totalPoints, polygonCoordinates)
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: (error as Error).message })
    }
    return
})

DistributedTokenController.get('/get-distribution-points', async (req, res): Promise<void> => {
    try {
        const result = await getAllDistributionPoints()
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: (error as Error).message })
    }
    return
})