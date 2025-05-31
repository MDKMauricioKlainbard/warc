import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt"
import bcrypt from "bcryptjs"
import { userModel } from "@server/modules/user/user.model"
import { Logger } from "winston"

/**
 * Inicializa las estrategias de autenticación de Passport.
 * 
 * Esta función configura dos estrategias principales:
 * 
 * 1. **Estrategia Local (`passport-local`)**:
 *    - Permite autenticar usuarios usando email y contraseña.
 *    - Se verifica que el email exista en la base de datos y que la contraseña coincida usando bcrypt.
 * 
 * 2. **Estrategia JWT (`passport-jwt`)**:
 *    - Permite autenticar solicitudes que incluyan un token JWT válido en el encabezado `Authorization`.
 *    - El payload del token debe incluir el `_id` del usuario.
 * 
 * @param logger Instancia del logger para registrar mensajes durante la inicialización.
 */
export const initializePassportStrategies = (logger: Logger): void => {
    logger.debug("Iniciando estrategias de autenticación para passport...")
    /**
     * Estrategia Local:
     * Utiliza `email` y `password` como credenciales.
     * Verifica si el usuario existe y si la contraseña es válida.
     */
    passport.use(new LocalStrategy(
        {
            usernameField: "email", // Campo que se usará como nombre de usuario
            passwordField: "password", // Campo que se usará como contraseña
        },
        async (email, password, done) => {
            try {
                const user = await userModel.findOne({ email })
                if (!user) {
                    return done(null, false, { message: "Usuario no encontrado" })
                }

                const isMatch = await bcrypt.compare(password, user.password)
                if (!isMatch) {
                    return done(null, false, { message: "Contraseña incorrecta" })
                }

                return done(null, user) // Autenticación exitosa
            } catch (error) {
                return done(error) // Error en la consulta o en la comparación
            }
        }
    ))

    // Verifica si existe JWT_SECRET. De lo contrario, advierte por consola.
    // Si el entorno es producción, detiene automáticamente el servidor para evitar fallos de seguridad.
    const { JWT_SECRET, NODE_ENV } = process.env
    if (!JWT_SECRET) {
        logger.warn("No se ha especificado un secreto JWT. Verificar archivo .env o variables de entorno en producción")
        if (NODE_ENV === "production") {
            logger.error("No se ha especificado un secreto JWT. El servidor se detendrá")
            process.exit(1)
        }
    }

    /**
     * Estrategia JWT:
     * Extrae el token JWT del encabezado `Authorization` como Bearer.
     * Verifica que el token sea válido y que el usuario exista en la base de datos.
     */
    passport.use(
        new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token del header
                secretOrKey: JWT_SECRET!, // Clave secreta para verificar el token
            },
            async (jwt_payload, done) => {
                try {
                    const user = await userModel.findById(jwt_payload._id)
                    if (!user) return done(null, false)
                    return done(null, user)
                } catch (err) {
                    return done(err, false) // Error al buscar el usuario
                }
            }
        )
    )

    logger.debug("Se han inicializado correctamente las estrategias de passport")
}
