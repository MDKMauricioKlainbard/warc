"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const user_model_1 = require("./user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Servicio de registro de nuevos usuarios.
 *
 * Verifica si ya existe un usuario con el mismo email.
 * Si no existe, crea un nuevo usuario en la base de datos con la contraseña hasheada.
 *
 * @param user - Objeto con los datos necesarios para crear el usuario:
 *  - name: nombre del usuario.
 *  - lastname: apellido del usuario.
 *  - email: correo electrónico (único).
 *  - password: contraseña en texto plano.
 *
 * @throws Error - Si ya existe un usuario con el mismo email.
 *
 * @returns void
 */
const register = async (user) => {
    const existingUser = await user_model_1.userModel.findOne({ email: user.email });
    if (existingUser) {
        throw new Error("Ya existe un usuario registrado con este email");
    }
    const hashedPassword = await bcryptjs_1.default.hash(user.password, 10);
    const newUser = new user_model_1.userModel({
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        password: hashedPassword,
        walletAddress: user.walletAddress
    });
    await newUser.save();
    return;
};
exports.register = register;
/**
 * Servicio de generación de token JWT luego del login exitoso.
 *
 * Recibe la información básica del usuario y genera un token firmado con JWT
 * que incluye el ID del usuario y una duración de 7 días.
 *
 * @param user - Objeto del usuario ya autenticado:
 *  - _id: ID del usuario en la base de datos.
 *  - name: nombre del usuario.
 *  - lastname: apellido del usuario.
 *  - email: correo electrónico del usuario.
 *
 * @returns Un objeto con:
 *  - token: el JWT generado.
 *  - user: objeto con los datos públicos del usuario (name, lastname, email).
 */
const login = (user) => {
    const payload = { _id: user._id };
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || "secret123", {
        expiresIn: "7d"
    });
    return {
        token,
        user: {
            email: user.email,
            name: user.name,
            lastname: user.lastname
        }
    };
};
exports.login = login;
