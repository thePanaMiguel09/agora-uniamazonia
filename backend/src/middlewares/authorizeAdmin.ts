import { Request, Response, NextFunction } from 'express';

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {

    const user = (req as any).user;
    if (user && user.fk_id_rol === 1) {
        next(); // Se dejar pasar por el rol
    } else {
        res.status(403).json({ error: 'Acceso denegado: Se requieren privilegios de administrador' });
    }
}