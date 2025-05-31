import mongoose from "mongoose";

/**
 * Esquema de usuario para la base de datos.
 * 
 * Representa los datos de un usuario del sistema, incluyendo credenciales y saldo de cuenta.
 * 
 * Campos:
 * - `username`: nombre de usuario único (obligatorio).
 * - `password`: contraseña del usuario (obligatorio).
 * - `accountBalance`: saldo actual del usuario en su cuenta (opcional, no puede ser negativo).
 * 
 * Además, el esquema incluye automáticamente las marcas de tiempo:
 * - `createdAt`: fecha de creación del documento.
 * - `updatedAt`: fecha de la última actualización.
 */
const userSchema = new mongoose.Schema({
    /**
     * Nombre de usuario único.
     * Es obligatorio y no puede repetirse en la base de datos.
     */
    username: {
        type: String,
        required: true,
        unique: true,
    },

    /**
     * Contraseña del usuario.
     * Es un campo obligatorio.
     */
    password: {
        type: String,
        required: true,
    },

    /**
     * Saldo de la cuenta del usuario.
     * Es un campo obligatorio.
     * Debe ser un número igual o mayor a 0.
     */
    accountBalance: {
        type: Number,
        required: true,
        min: 0,
    },
}, {
    /**
     * Incluye automáticamente los campos `createdAt` y `updatedAt`.
     */
    timestamps: true
});

/**
 * Modelo de usuario basado en el esquema definido.
 * Se guarda en la colección "users" de MongoDB.
 */
export const userModel = mongoose.model("user", userSchema, "users");
