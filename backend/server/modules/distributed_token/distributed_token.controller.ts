import express from "express"
import { exchangePointsInCoordinate, generateRandomPoints, getAllDistributionPoints } from "./distributes_token.service"

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

/**
 * @swagger
 * api/distributed-token/exchange-tokens:
 *   post:
 *     summary: Canjea tokens desde un punto de distribución cercano
 *     tags: [Tokens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coordinateId
 *               - userPosition
 *               - userId
 *             properties:
 *               coordinateId:
 *                 type: string
 *                 description: ID del punto de distribución.
 *                 example: "64ff4e2b123a9a001e77e5d9"
 *               userPosition:
 *                 type: array
 *                 description: Coordenadas del usuario en formato [longitud, latitud].
 *                 items:
 *                   type: number
 *                 minItems: 2
 *                 maxItems: 2
 *                 example: [-70.6506, -33.4372]
 *               userId:
 *                 type: string
 *                 description: ID del usuario que solicita el canje.
 *                 example: "64ff4d99123a9a001e77e5d7"
 *     responses:
 *       200:
 *         description: Transacción realizada con éxito
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Transacción realizada con éxito.
 *       500:
 *         description: Error al realizar el canje de tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: La distancia al punto de distribución debe ser menor o igual a 10 metros
 */
DistributedTokenController.post("/exchange-tokens", async (req, res): Promise<void> => {
    try {
        const {coordinateId, userPosition, userId} = req.body;
        await exchangePointsInCoordinate(coordinateId, userPosition, userId)
        res.status(200).send("Transacción realizada con éxito.")
    } catch (error) {
        res.status(500).json({message: (error as Error).message})
    }
    return
})
