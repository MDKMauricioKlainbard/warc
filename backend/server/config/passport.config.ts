import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt"
import bcrypt from "bcryptjs"
import { userModel } from "@server/modules/user/user.model"
import { Logger } from "winston"

export const initializePassportStrategies = (logger: Logger): void => {
    logger.debug("Iniciando estrategias de autenticación para passport...")
    // LOCAL STRATEGY (email y password)
    passport.use(new LocalStrategy(
        { usernameField: "email", passwordField: "password" },
        async (email, password, done) => {
            try {
                const user = await userModel.findOne({ email })
                if (!user) {
                    return done(null, false, { message: "Usuario no encontrado" })
                }
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: "Contraseña incorrecta" })
                }
                return done(null, user)
            } catch (error) {
                return done(error)
            }
        }
    ));

    // JWT STRATEGY
    passport.use(
        new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: process.env.JWT_SECRET || "secret123",
            },
            async (jwt_payload, done) => {
                try {
                    const user = await userModel.findById(jwt_payload._id);
                    if (!user) return done(null, false);
                    return done(null, user);
                } catch (err) {
                    return done(err, false);
                }
            }
        )
    );

    logger.debug("Se han inicializado correctamente las estrategias de passport")
    return
}

