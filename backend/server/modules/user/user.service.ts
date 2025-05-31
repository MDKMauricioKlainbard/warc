import { userModel } from "./user.model"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";

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
export const register = async (user: { name: string, lastname: string, email: string, password: string, walletAddress: string }) => {
    const existingUser = await userModel.findOne({ email: user.email })

    if (existingUser) {
        throw new Error("Ya existe un usuario registrado con este email")
    }
    const hashedPassword = await bcrypt.hash(user.password, 10)

    const newUser = new userModel({
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        password: hashedPassword,
        walletAddress: user.walletAddress
    })
    await newUser.save()

    return
}


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
export const login = (user: { _id: string, name: string, lastname: string, email: string }): {
    token: string,
    user: {
        email: string,
        name: string,
        lastname: string,
    }
} => {
    const payload = { _id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret123", {
        expiresIn: "7d"
    })
    return {
        token,
        user: {
            email: user.email,
            name: user.name,
            lastname: user.lastname
        }
    }
}
