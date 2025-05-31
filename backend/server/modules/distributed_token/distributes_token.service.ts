import { bbox, pointToPolygonDistance, polygon, randomPoint } from "@turf/turf"
import { distributedTokenModel } from "./distributed_token.model"

/**
 * Genera coordenadas aleatorias dentro de un polígono y distribuye
 * de manera aleatoria una cantidad total de tokens entre ellas.
 * 
 * @param {number} totalPoints - Cantidad total de tokens a distribuir.
 * @param {number[][]} polygonCoordinates - Coordenadas del polígono donde se deben generar los puntos. 
 * El array debe representar un polígono cerrado (mínimo 4 puntos con el último igual al primero).
 * 
 * @returns {Promise<{coordinates: [number, number], quantity: number}[]>} 
 * Retorna un array de objetos, cada uno con coordenadas geográficas y una cantidad de tokens asignada.
 * 
 * @throws {Error} Si la cantidad total de tokens es negativa o el polígono no tiene suficientes vértices.
 */
export const generateRandomPoints = async (
    totalPoints: number,
    polygonCoordinates: number[][]
): Promise<{
    coordinates: [number, number],
    quantity: number,
}[]> => {
    // Validaciones iniciales
    if (totalPoints < 0) {
        throw new Error("La cantidad debe ser mayor a 0")
    }
    if (polygonCoordinates.length < 4) {
        throw new Error("El polígono debe tener al menos 4 puntos.")
    }

    // Se crea un polígono válido y se obtiene su bounding box para limitar el área de búsqueda
    const regionPolygon = polygon([polygonCoordinates])
    const boundingBox = bbox(regionPolygon)

    // Definimos la cantidad de coordenadas diferentes que se van a generar (slots)
    const maxCoordinateSlots = 20
    const minCoordinateSlots = 5
    const totalCoordinateSlots = Math.min(
        Math.max(Math.floor(Math.random() * totalPoints), minCoordinateSlots),
        maxCoordinateSlots
    )

    // Se distribuyen los tokens en forma aleatoria pero controlada entre los slots
    const assignedPoints: number[] = []
    let remainingPoints = totalPoints

    for (let i = 0; i < totalCoordinateSlots; i++) {
        const slotsLeft = totalCoordinateSlots - i
        const maxPerPoint = Math.floor(totalPoints * 0.3)
        const minPerPoint = 5

        // Se limita la cantidad máxima y mínima por punto para evitar distribuciones injustas
        const maxAllowed = Math.min(maxPerPoint, remainingPoints - (slotsLeft - 1) * minPerPoint)
        const minAllowed = Math.max(minPerPoint, remainingPoints - (slotsLeft - 1) * maxPerPoint)

        // Si es el último slot, se le asigna lo que queda; si no, se asigna aleatoriamente dentro del rango
        const points = (i === totalCoordinateSlots - 1)
            ? remainingPoints
            : Math.floor(Math.random() * (maxAllowed - minAllowed + 1)) + minAllowed

        assignedPoints.push(points)
        remainingPoints -= points
    }

    // Array donde se almacenarán las coordenadas válidas generadas con su cantidad asignada
    const generatedCoordinates: { coordinates: [number, number], quantity: number }[] = []
    let attempts = 0

    // Se generan coordenadas aleatorias dentro del bounding box y se filtran las que están dentro del polígono
    while (generatedCoordinates.length < totalCoordinateSlots && attempts < 1000) {
        attempts++

        const point = randomPoint(1, { bbox: boundingBox })
        const feature = point.features[0]

        // Se verifica que el punto esté dentro del polígono
        if (pointToPolygonDistance(feature, regionPolygon) < 0) {
            const newCoord: [number, number] = feature.geometry.coordinates as [number, number]
            const newRegister = {
                coordinates: newCoord,
                quantity: assignedPoints[generatedCoordinates.length]
            }

            // Se guarda tanto en el array como en la base de datos
            generatedCoordinates.push(newRegister)
            distributedTokenModel.create(newRegister)
        }
    }

    return generatedCoordinates
}

export const getAllDistributionPoints = async () => {
    const distributionPoints = await distributedTokenModel.find();
    return distributionPoints
}