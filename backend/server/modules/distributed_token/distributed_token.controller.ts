import express from "express"
import { generateRandomPoints, getAllDistributionPoints } from "./distributes_token.service"

export const DistributedTokenController = express.Router()

/**
 * @swagger
 * api/distributed-token/in-polygon:
 *   post:
 *     summary: Genera puntos aleatorios dentro de un polígono con distribución de tokens
 *     tags: [Tokens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - totalPoints
 *               - polygonCoordinates
 *             properties:
 *               totalPoints:
 *                 type: integer
 *                 description: Cantidad total de tokens a distribuir.
 *                 example: 100
 *               polygonCoordinates:
 *                 type: array
 *                 description: Lista de coordenadas que forman el polígono (cerrado).
 *                 items:
 *                   type: array
 *                   items:
 *                     type: number
 *                 example: [[-73.97, 40.77], [-73.88, 40.78], [-73.88, 40.71], [-73.97, 40.71], [-73.97, 40.77]]
 *     responses:
 *       200:
 *         description: Puntos generados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [-73.93, 40.74]
 *                   quantity:
 *                     type: integer
 *                     example: 15
 *       500:
 *         description: Error del servidor
 */
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

/**
 * @swagger
 * api/distributed-token/get-distribution-points:
 *   get:
 *     summary: Obtiene todos los puntos de distribución generados
 *     tags: [Tokens]
 *     responses:
 *       200:
 *         description: Lista de puntos de distribución existentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "683b226e02600c8a5c2a2378"
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [-73.93, 40.74]
 *                   quantity:
 *                     type: integer
 *                     example: 15
 *       500:
 *         description: Error al obtener los puntos
 */
DistributedTokenController.get('/get-distribution-points', async (req, res): Promise<void> => {
    try {
        const result = await getAllDistributionPoints()
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: (error as Error).message })
    }
    return
})
