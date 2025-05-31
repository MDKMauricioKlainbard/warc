import { bbox, distance, pointToPolygonDistance, polygon, randomPoint } from "@turf/turf"
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

/**
 * Obtiene todos los puntos de distribución generados previamente.
 * 
 * Esta función consulta la base de datos utilizando el modelo `distributedTokenModel`
 * y devuelve todos los documentos almacenados que representan puntos con coordenadas
 * y cantidades asignadas de tokens.
 * 
 * @returns {Promise<Array<Object>>} Una promesa que se resuelve con un array de objetos,
 * cada uno representando un punto de distribución con su cantidad asignada.
 */
export const getAllDistributionPoints = async () => {
    const distributionPoints = await distributedTokenModel.find();
    return distributionPoints;
}

export const exchangePointsInCoordinate = async (coordinateId: string, userPosition: [number, number], userId: string): Promise<void> => {
    // SE HACEN VALIDACIONES INICIALES:
    if (!userId) {
        throw new Error("No se ha dado el ID del usuario.")
    }
    if (!coordinateId) {
        throw new Error("No se ha dado el ID del punto de distribución.")
    }
    if (userPosition.length !== 2) {
        throw new Error("Las coordenadas del usuario deben ser [longitud, latitud]")
    }

    // SE TOMA EL PUNTO DE DISTRIBUCIÓN Y EL USUARIO DE LA BASE DE DATOS, SE HACE CON PROMISE.ALL PARA PARALELIZAR LAS PROMESAS
    const [distributionPoint, user] = await Promise.all([distributedTokenModel.findById(coordinateId), "dummy-user"])
    // SI NO EXISTE SE TIRA ERROR
    if (!distributionPoint) {
        throw new Error("No se ha encontrado el punto de distribución")
    }
    const { quantity, coordinates } = distributionPoint

    // CREADO EL MODELO DE USUARIO, SE VALIDA PRIMERO SI EL USUARIO ESTÁ A RANGO DEL PUNTO DE DISTRIBUCIÓN
    const distanceFromDistributionPoint = distance(coordinates, userPosition, { units: "meters" })
    if (distanceFromDistributionPoint > 10) {
        throw new Error("La distancia al punto de distribución debe ser menor o igual a 10 metros")
        // NO SE PERMITE AL USUARIO OBTENER LOS PUNTOS SI ESTÁ A MÁS DE 10 METROS DE DISTANCIA
    }

    // SE ASIGNAN PUNTOS: user.quantity += quantity; user.save()
    // SE ELIMINA EL PUNTO DE DISTRIBUCIÓN (DEBERÍA SER UN SOFT DELETE, PERO NO HAY TIEMPO PARA ESO)
    distributedTokenModel.deleteOne({ _id: coordinateId })

    return;
}