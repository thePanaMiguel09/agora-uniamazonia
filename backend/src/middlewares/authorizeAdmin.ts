import { Request, Response, NextFunction } from "express";

/**
 * Interfaz que extiende la petición de Express para incluir la información del usuario autenticado.
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id_usuario: number;
    fk_id_rol: number;
    [key: string]: unknown;
  };
}

/**
 * Middleware de autorización para restringir el acceso exclusivamente a usuarios con rol de Administrador (`fk_id_rol === 1`).
 *
 * @param {AuthenticatedRequest} req - Petición HTTP extendida, debe incluir `req.user` validado previamente por el middleware de autenticación.
 * @param {Response} res - Objeto de respuesta de Express.
 * @param {NextFunction} next - Función para continuar con el siguiente middleware o controlador.
 * @returns {void | Response}
 */
export const authorizeAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void | Response => {
  const user = req.user;

  if (user && user.fk_id_rol === 1) {
    return next(); // Permite el paso si es administrador
  }

  return res.status(403).json({
    error:
      "Acceso denegado: Se requieren privilegios de administrador para realizar esta acción.",
  });
};
