"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchangePointsInCoordinate = exports.getAllDistributionPoints = exports.generateRandomPoints = void 0;
const turf_1 = require("@turf/turf");
const distributed_token_model_1 = require("./distributed_token.model");
const user_model_1 = require("../user/user.model");
const wallet_config_1 = require("../../config/wallet.config");
const big_js_1 = __importDefault(require("big.js"));
/**
 * Genera coordenadas aleatorias dentro de un polígono y distribuye aleatoriamente una cantidad total de tokens entre ellas.
 *
 * Este método:
 * - Calcula una cantidad aleatoria de ubicaciones (slots de distribución) dentro del polígono.
 * - Genera coordenadas aleatorias dentro del área definida por un bounding box del polígono.
 * - Verifica que cada punto generado esté realmente dentro del polígono.
 * - Luego distribuye `totalTokens` de forma aleatoria entre los puntos válidos:
 *    - Por cada unidad entera, se lanza un dado para asignar 1 token a un punto aleatorio.
 *    - Si hay parte decimal, se asigna directamente al primer punto generado.
 *
 * @param {number} totalTokens - Cantidad total (entera o decimal) de tokens a distribuir.
 * @param {number[][]} polygonCoordinates - Coordenadas que definen el polígono (el último punto debe ser igual al primero).
 * @param {string} walletAddress - La dirección pública de la billetera que emite la petición para distribuir los puntos en el polígono.
 *
 * @returns {Promise<{coordinates: [number, number], quantity: number}[]>}
 * Un arreglo de objetos, cada uno representando una coordenada y la cantidad de tokens asignados.
 *
 * @throws {Error} Si la cantidad de tokens es negativa o el polígono tiene menos de 4 vértices.
 */
const generateRandomPoints = async (totalTokens, polygonCoordinates, walletAddress) => {
    // Validación de que la cantidad no sea negativa
    if (totalTokens < 0) {
        throw new Error("La cantidad total de tokens debe ser mayor o igual a 0.");
    }
    // Validación de que el polígono esté bien definido (mínimo 4 puntos, último punto igual al primero)
    if (polygonCoordinates.length < 4) {
        throw new Error("El polígono debe tener al menos 4 vértices (incluyendo el cierre del mismo).");
    }
    await wallet_config_1.wallet.transferWARCToDistributionPool(walletAddress, totalTokens);
    // Se crea un polígono válido a partir de las coordenadas
    const polygonRegion = (0, turf_1.polygon)([polygonCoordinates]);
    // Se calcula el bounding box para limitar la región donde se buscarán puntos aleatorios
    const bounds = (0, turf_1.bbox)(polygonRegion);
    // Determina cuántos puntos de distribución se generarán
    const minSlots = 5;
    const maxSlots = 20;
    const slotsCount = Math.min(Math.max(Math.floor(Math.random() * totalTokens), minSlots), maxSlots);
    // Aquí almacenaremos los puntos válidos con su cantidad inicial (0 tokens)
    const distributionPoints = [];
    let generationAttempts = 0;
    // Genera coordenadas aleatorias dentro del bounding box
    // y filtra aquellas que estén realmente dentro del polígono
    while (distributionPoints.length < slotsCount && generationAttempts < 1000) {
        generationAttempts++;
        const randomFeature = (0, turf_1.randomPoint)(1, { bbox: bounds }).features[0];
        // Validamos que el punto esté dentro del polígono
        const isInsidePolygon = (0, turf_1.pointToPolygonDistance)(randomFeature, polygonRegion) < 0;
        if (isInsidePolygon) {
            const coord = randomFeature.geometry.coordinates;
            distributionPoints.push({
                coordinates: coord,
                quantity: 0
            });
        }
    }
    // Separamos la parte entera y decimal de los tokens totales
    const wholeTokens = Math.floor(totalTokens);
    // El cálculo con decimales se ve afectado por la precisión flotante de los números en JS.
    // La parte fraccionaria debe calcularse con una librería de alta precisión:
    const fractionalTokens = new big_js_1.default(totalTokens).minus(wholeTokens).toNumber();
    // Si hay parte decimal, se asigna al primer punto
    if (fractionalTokens > 0) {
        distributionPoints[0].quantity += fractionalTokens;
    }
    // Repartimos los tokens enteros uno por uno, aleatoriamente
    for (let i = 0; i < wholeTokens; i++) {
        const selectedIndex = Math.floor(Math.random() * distributionPoints.length);
        distributionPoints[selectedIndex].quantity += 1;
    }
    // Filtramos los puntos que recibieron al menos una fracción de token
    const pointsWithTokens = distributionPoints.filter(p => p.quantity > 0);
    // Guardamos los puntos en la base de datos
    await distributed_token_model_1.distributedTokenModel.insertMany(pointsWithTokens);
    // Retornamos todos los puntos generados (con tokens asignados)
    return pointsWithTokens;
};
exports.generateRandomPoints = generateRandomPoints;
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
const getAllDistributionPoints = async () => {
    const distributionPoints = await distributed_token_model_1.distributedTokenModel.find();
    return distributionPoints;
};
exports.getAllDistributionPoints = getAllDistributionPoints;
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
const exchangePointsInCoordinate = async (coordinateId, userPosition, userId) => {
    if (!userId) {
        throw new Error("No se ha dado el ID del usuario.");
    }
    if (!coordinateId) {
        throw new Error("No se ha dado el ID del punto de distribución.");
    }
    if (userPosition.length !== 2) {
        throw new Error("Las coordenadas del usuario deben ser [longitud, latitud]");
    }
    // Busca en paralelo el punto de distribución y el usuario
    const [distributionPoint, user] = await Promise.all([
        distributed_token_model_1.distributedTokenModel.findById(coordinateId),
        user_model_1.userModel.findById(userId)
    ]);
    if (!distributionPoint) {
        throw new Error("No se ha encontrado el punto de distribución");
    }
    if (!user) {
        throw new Error("No se ha encontrado al usuario");
    }
    const { quantity, coordinates } = distributionPoint;
    // Verifica la distancia entre el usuario y el punto de distribución
    const distanceFromDistributionPoint = (0, turf_1.distance)(coordinates, userPosition, { units: "meters" });
    if (distanceFromDistributionPoint > 10) {
        throw new Error("La distancia al punto de distribución debe ser menor o igual a 10 metros");
    }
    // Transfiere los tokens WARC al usuario
    await wallet_config_1.wallet.transferWARCFromDistributionPool(user.walletAddress, quantity);
    // Elimina el punto de distribución tras la recolección
    await distributed_token_model_1.distributedTokenModel.deleteOne({ _id: coordinateId });
    return;
};
exports.exchangePointsInCoordinate = exchangePointsInCoordinate;
