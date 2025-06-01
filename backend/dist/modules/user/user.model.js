"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// DESPUÉS VEMOS SI METEMOS ACÁ AUTENTICACIÓN DE TERCEROS
/**
 * Esquema de usuario para la base de datos.
 *
 * Representa los datos personales y de acceso de un usuario del sistema,
 * incluyendo su nombre, correo electrónico, contraseña y, opcionalmente,
 * la dirección de su billetera en la red Polkadot.
 *
 * Campos:
 * - `name`: nombre del usuario (obligatorio).
 * - `lastname`: apellido del usuario (obligatorio).
 * - `email`: correo electrónico único (obligatorio).
 * - `password`: contraseña del usuario (obligatorio).
 * - `walletAddress`: dirección pública de la billetera del usuario en la red Polkadot (opcional).
 *
 * El esquema incluye automáticamente:
 * - `createdAt`: fecha de creación del documento.
 * - `updatedAt`: fecha de la última modificación.
 */
const userSchema = new mongoose_1.default.Schema({
    /**
     * Nombre del usuario.
     * Campo obligatorio.
     */
    name: {
        type: String,
        required: true,
    },
    /**
     * Apellido del usuario.
     * Campo obligatorio.
     */
    lastname: {
        type: String,
        required: true,
    },
    /**
     * Correo electrónico del usuario.
     * Debe ser único y es obligatorio.
     */
    email: {
        type: String,
        required: true,
        unique: true,
    },
    /**
     * Contraseña del usuario.
     * Campo obligatorio.
     */
    password: {
        type: String,
        required: true,
    },
    /**
     * Dirección pública de la billetera del usuario en la red Polkadot.
     * Este campo es obligatorio.
     *
     * Ejemplo de dirección en Polkadot:
     * `14p1VYt5bEdbFZ4C2iHt6RQ5k9q2ZfUvM1sDeXr...`
     */
    walletAddress: {
        type: String,
        required: true,
    }
}, {
    /**
     * Habilita automáticamente los campos `createdAt` y `updatedAt`.
     */
    timestamps: true
});
/**
 * Modelo de usuario basado en el esquema definido.
 * Se guarda en la colección "users" de MongoDB.
 */
exports.userModel = mongoose_1.default.model("user", userSchema, "users");
