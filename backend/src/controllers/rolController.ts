import { pool } from '../config/db';
import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';

// Obtener todos los roles
export const getRoles = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('CALL OBTENER_ROLES()');

    const roles = (rows[0] as any[]).map((rol: any) => ({
      id_rol: rol.ID_ROL ?? rol.id_rol,
      nombre_rol: rol.NOMBRE_ROL ?? rol.nombre_rol,
    }));

    res.json(roles);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ message: 'Error al obtener los roles' });
  }
};
