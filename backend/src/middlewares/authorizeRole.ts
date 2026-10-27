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
 * Middleware de autorización basado en roles. Permite el acceso únicamente si el rol
 * del usuario autenticado se encuentra dentro de la lista de roles permitidos.
 *
 * @param {number[]} allowedRoles - Arreglo con los IDs de los roles permitidos para acceder a la ruta.
 * @returns {(req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response} Middleware de Express configurado.
 */
export const authorizeRole = (allowedRoles: number[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void | Response => {
    const user = req.user;

    if (!user) {
      return res
        .status(401)
        .json({ error: "No autenticado. Usuario no autenticado." });
    }

    if (allowedRoles.includes(user.fk_id_rol)) {
      return next();
    }

    return res.status(403).json({
      error: `Acceso denegado: Se requiere uno de los siguientes roles: ${allowedRoles.join(", ")}`,
    });
  };
};
