import { bbox, distance, pointToPolygonDistance, polygon, randomPoint } from "@turf/turf"
import { distributedTokenModel } from "./distributed_token.model"
import { userModel } from "../user/user.model"
import { wallet } from "@server/config/wallet.config"
import { parseEther } from "ethers"
import Big from "big.js"

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
                quantity: 0
            }
            generatedCoordinates.push(newRegister)
            //distributedTokenModel.create(newRegister)
        }
    }

    const integerPart = Math.floor(totalPoints)
    const decimalPart = new Big(totalPoints).minus(integerPart).toNumber()
    generatedCoordinates[0].quantity += decimalPart > 0 ? decimalPart : 0
    let index;

    for (let i = 0; i < integerPart; i++) {
        index = Math.floor(Math.random() * generatedCoordinates.length);
        generatedCoordinates[index].quantity += 1;
    }

    const validDistributionPoints = generatedCoordinates.filter((distributionPoint) => distributionPoint.quantity > 0)
    await distributedTokenModel.insertMany(validDistributionPoints)

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

/**
 * Intercambia puntos WARC en un punto de distribución cercano a la posición del usuario.
 * 
 * Esta función permite que un usuario recoja tokens (puntos) desde un punto de distribución geolocalizado
 * si se encuentra a una distancia de **10 metros o menos** del mismo.
 * 
 * ### Flujo:
 * 1. Valida los parámetros necesarios.
 * 2. Busca el punto de distribución y el usuario en la base de datos.
 * 3. Verifica que el usuario esté físicamente dentro del rango permitido.
 * 4. Realiza la transferencia de tokens a la billetera del usuario.
 * 5. Elimina el punto de distribución una vez completado el intercambio.
 * 
 * ---
 * @param coordinateId `string` - ID del punto de distribución registrado en la base de datos.
 * @param userPosition `[number, number]` - Coordenadas del usuario en formato `[longitud, latitud]`.
 * @param userId `string` - ID del usuario que desea canjear los puntos.
 * 
 * @throws Error si falta algún parámetro obligatorio.
 * @throws Error si el usuario o el punto de distribución no existen.
 * @throws Error si la distancia entre el usuario y el punto de distribución es mayor a 10 metros.
 * 
 * ---
 * @returns `Promise<void>` - No devuelve un valor. La función realiza sus acciones como efectos secundarios:
 *   - Transferencia de tokens.
 *   - Eliminación del punto de distribución.
 */
export const exchangePointsInCoordinate = async (
    coordinateId: string,
    userPosition: [number, number],
    userId: string
): Promise<void> => {
    if (!userId) {
        throw new Error("No se ha dado el ID del usuario.")
    }
    if (!coordinateId) {
        throw new Error("No se ha dado el ID del punto de distribución.")
    }
    if (userPosition.length !== 2) {
        throw new Error("Las coordenadas del usuario deben ser [longitud, latitud]")
    }

    // Busca en paralelo el punto de distribución y el usuario
    const [distributionPoint, user] = await Promise.all([
        distributedTokenModel.findById(coordinateId),
        userModel.findById(userId)
    ])

    if (!distributionPoint) {
        throw new Error("No se ha encontrado el punto de distribución")
    }
    if (!user) {
        throw new Error("No se ha encontrado al usuario")
    }

    const { quantity, coordinates } = distributionPoint

    // Verifica la distancia entre el usuario y el punto de distribución
    const distanceFromDistributionPoint = distance(coordinates, userPosition, { units: "meters" })
    if (distanceFromDistributionPoint > 10) {
        throw new Error("La distancia al punto de distribución debe ser menor o igual a 10 metros")
    }

    // Transfiere los tokens WARC al usuario
    wallet.transferWARC(user.walletAddress, quantity.toString())

    // Elimina el punto de distribución tras la recolección
    await distributedTokenModel.deleteOne({ _id: coordinateId })

    return;
}
