import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Interfaz que extiende la petición de Express para incluir la información del usuario autenticado.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id_usuario: number;
    fk_id_rol: number;
    [key: string]: unknown;
  };
}

/**
 * Middleware de autenticación para verificar la validez del token JWT en las peticiones HTTP.
 *
 * @param {AuthenticatedRequest} req - Objeto de petición HTTP extendido con los datos del usuario.
 * @param {Response} res - Objeto de respuesta de Express.
 * @param {NextFunction} next - Función para continuar con el siguiente middleware o controlador.
 * @returns {Promise<void | Response>}
 */
const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({
          error: "No autenticado. Token ausente o con formato inválido.",
        });
    }

    const token = authHeader.replace("Bearer ", "");
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error(
        "Error crítico: JWT_SECRET no está definido en las variables de entorno.",
      );
      return res
        .status(500)
        .json({ error: "Error interno de configuración del servidor." });
    }

    const decoded = jwt.verify(token, jwtSecret);

    // Asignar el payload decodificado a req.user asegurando tipado compatible
    req.user = decoded as AuthenticatedRequest["user"];

    return next();
  } catch (error: unknown) {
    console.error(
      "Error de autenticación:",
      error instanceof Error ? error.message : error,
    );
    return res
      .status(401)
      .json({ error: "No autenticado. Token inválido o expirado." });
  }
};

export default authenticate;
