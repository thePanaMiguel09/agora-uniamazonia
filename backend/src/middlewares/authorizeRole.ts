import { Request, Response, NextFunction } from 'express';

export const authorizeRole = (allowedRoles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (allowedRoles.includes(user.fk_id_rol)) {
      next();
    } else {
      res.status(403).json({ 
        error: `Acceso denegado: Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}` 
      });
    }
  };
};
