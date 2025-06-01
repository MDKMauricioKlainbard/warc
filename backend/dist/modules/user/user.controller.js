"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const user_service_1 = require("./user.service");
exports.UserController = express_1.default.Router();
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
 *               - walletAddress
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
 *               walletAddress:
 *                 type: string
 *                 example: "0xe81189076cdbeb3D77c7d04C451b26eA6c43B4D0"
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
exports.UserController.post("/register", async (req, res) => {
    try {
        const { name, lastname, email, password, walletAddress } = req.body;
        await (0, user_service_1.register)({ name, lastname, email, password, walletAddress });
        res.status(200).send("Usuario registrado con éxito");
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
    return;
});
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
 *                     _id:
 *                       type: string
 *                       example: 683b84b9d1ad3ee1e58b550e
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
exports.UserController.post("/login", passport_1.default.authenticate("local", { session: false }), (req, res) => {
    try {
        const user = req.user;
        const result = (0, user_service_1.login)(user);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
    return;
});
