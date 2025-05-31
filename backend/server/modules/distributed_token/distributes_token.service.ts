// ENTRADA: CANTIDAD DE TOKENS, PUNTOS DE POLÍGONO
// SALIDA: PUNTOS EN EL MAPA GENERADOS DE FORMA ALEATORIA CON DISTRIBUCIÓN ALEATORIA DE TOKENS
// LIBRERIA: TURF
// EJEMPLO: [[1,2], [3,1], BLABLA]
import { bbox, pointToPolygonDistance, polygon, randomPoint } from "@turf/turf"
import { logger } from "@loaders/logger/logger.loader"

export const generateRandomPoints = async (totalPoints: number, polygonCoordinates: number[][]): Promise<{
    coordinates: [number, number],
    quantity: number,
}[]> => {
    if (totalPoints < 0) {
        throw new Error("La cantidad debe ser mayor a 0")
    }
    if (polygonCoordinates.length < 3) {
        throw new Error("El polígono debe tener al menos 4 puntos.")
    }

    const regionPolygon = polygon([polygonCoordinates]);
    const boundingBox = bbox(regionPolygon);
    const maxCoordinateSlots = 20
    const minCoordinateSlots = 5
    const totalCoordinateSlots = Math.min(
        Math.max(Math.floor(Math.random() * totalPoints), minCoordinateSlots),
        maxCoordinateSlots
    )

    // Inicializamos array de coordenadas y puntos asignados
    const assignedPoints: number[] = []
    let remainingPoints = totalPoints

    for (let i = 0; i < totalCoordinateSlots; i++) {
        const slotsLeft = totalCoordinateSlots - i
        const maxPerPoint = Math.floor(totalPoints * 0.3)
        const minPerPoint = 5

        // Garantizamos que no se asignen 0 ni cantidades absurdas
        const maxAllowed = Math.min(maxPerPoint, remainingPoints - (slotsLeft - 1) * minPerPoint)
        const minAllowed = Math.max(minPerPoint, remainingPoints - (slotsLeft - 1) * maxPerPoint)
        const points = (i === totalCoordinateSlots - 1)
            ? remainingPoints // Último punto recibe lo que queda
            : Math.floor(Math.random() * (maxAllowed - minAllowed + 1)) + minAllowed

        assignedPoints.push(points)
        remainingPoints -= points
    }

    const generatedCoordinates: { coordinates: [number, number], quantity: number }[] = []
    let attempts = 0

    while (generatedCoordinates.length < totalCoordinateSlots && attempts < 1000) {
        attempts++

        const point = randomPoint(1, { bbox: boundingBox })
        const feature = point.features[0]

        // Verificamos si está dentro del polígono
        if (pointToPolygonDistance(feature, regionPolygon) < 0) {
            const newCoord: [number, number] = feature.geometry.coordinates as [number, number]
            generatedCoordinates.push({
                coordinates: newCoord,
                quantity: assignedPoints[generatedCoordinates.length]
            })
        }
    }

    return generatedCoordinates
}