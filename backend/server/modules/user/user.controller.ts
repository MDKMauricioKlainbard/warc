import express from "express"
import passport from "passport"
import { login, register } from "./user.service"

export const UserController = express.Router()

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints para autenticación y registro de usuarios
 */

/**
 * @swagger
 * api/user/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       description: Datos del usuario a registrar
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - lastname
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan
 *               lastname:
 *                 type: string
 *                 example: Pérez
 *               email:
 *                 type: string
 *                 example: juan.perez@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mi_contraseña_segura123
 *     responses:
 *       200:
 *         description: Usuario registrado con éxito
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Usuario registrado con éxito
 *       500:
 *         description: Error al registrar el usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ya existe un usuario registrado con este email
 */
UserController.post("/register", async (req, res) => {
    try {
        const { name, lastname, email, password } = req.body
        await register({ name, lastname, email, password })
        res.status(200).send("Usuario registrado con éxito")
    } catch (error) {
        res.status(500).json({ message: (error as Error).message })
    }
    return
})

/**
 * @swagger
 * api/user/login:
 *   post:
 *     summary: Iniciar sesión con email y contraseña
 *     tags: [Usuarios]
 *     requestBody:
 *       description: Credenciales del usuario
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan.perez@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mi_contraseña_segura123
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente, retorna token JWT y datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: juan.perez@email.com
 *                     name:
 *                       type: string
 *                       example: Juan
 *                     lastname:
 *                       type: string
 *                       example: Pérez
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */
UserController.post("/login", passport.authenticate("local", { session: false }), (req, res) => {
    try {
        const user = req.user as any;
        const result = login(user);
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: (error as Error).message })
    }
    return
})
