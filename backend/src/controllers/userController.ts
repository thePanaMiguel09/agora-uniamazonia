import { pool } from '../config/db';
import { Request, Response } from "express";
import { RowDataPacket } from 'mysql2';

// Obtener todos los usuarios
export const getUsers = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('CALL OBTENER_USUARIOS()');

    // Al usar CALL, mysql2 devuelve un arreglo de arreglos
    const users = rows[0];

    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
};

// Eliminar un usuario
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('CALL ELIMINAR_USUARIO(?)', [id]);

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error interno al eliminar usuario' });
  }
};

// Editar un usuario
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre_completo, username, email, estado, fk_id_rol } = req.body;
  const estadoNumerico = estado === 'activo' ? 1 : 0;

  try {
    await pool.query(
      'CALL ACTUALIZAR_USUARIO(?, ?, ?, ?, ?, ?)',
      [id, nombre_completo, username, email, estadoNumerico, fk_id_rol]
    );

    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error interno al actualizar usuario' });
  }
};