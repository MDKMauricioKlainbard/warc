"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.distributedTokenModel = void 0;
/**
 * Módulo para el modelo de tokens distribuidos geográficamente
 *
 * @module DistributedTokenModel
 */
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Esquema de Mongoose para tokens distribuidos en ubicaciones geográficas
 *
 * @description
 * Representa un punto geográfico que contiene una cantidad específica de tokens.
 * Por ejemplo: 1000 WARCs en una ubicación con coordenadas [lat, lng].
 *
 * @property {number} quantity - Cantidad de tokens almacenados en esta ubicación
 * @property {number[]} coordinates - Coordenadas geográficas [longitud, latitud]
 * @property {Date} createdAt - Fecha de creación (automática)
 * @property {Date} updatedAt - Fecha de última actualización (automática)
 */
const distributedTokenSchema = new mongoose_1.default.Schema({
    quantity: {
        type: Number,
        required: [true, 'La cantidad de tokens es obligatoria'],
        validate: {
            validator: (quantity) => quantity > 0,
            message: 'La cantidad de tokens debe ser mayor a 0'
        }
    },
    coordinates: {
        type: [Number],
        required: [true, 'Las coordenadas son obligatorias'],
        validate: {
            validator: (coords) => coords.length === 2,
            message: 'Las coordenadas deben ser [longitud, latitud]'
        }
    },
}, {
    timestamps: true // Añade automáticamente createdAt y updatedAt
});
/**
 * Modelo Mongoose para los tokens distribuidos
 *
 * @description
 * Interface TypeScript (para uso opcional):
 * interface IDistributedToken {
 *   quantity: number;
 *   coordinates: [number, number];
 *   createdAt?: Date;
 *   updatedAt?: Date;
 * }
 *
 * @type {mongoose.Model}
 *
 * @param {string} "distributed_token" - Nombre del modelo
 * @param {mongoose.Schema} distributedTokenSchema - Esquema definido
 * @param {string} "distributed_tokens" - Nombre de la colección en MongoDB
 */
exports.distributedTokenModel = mongoose_1.default.model("distributed_token", distributedTokenSchema, "distributed_tokens");
