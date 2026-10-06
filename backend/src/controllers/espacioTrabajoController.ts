import { pool } from '../config/db';
import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Listar espacios de trabajo
export const OBTENER_ESPACIOS_TRABAJO = async (req: Request, res: Response) => {
  try {
    const { idproyecto } = req.params;
    const user = (req as any).user;
    
    if (!idproyecto) {
      return res.status(400).json({ message: 'El parámetro idproyecto es requerido' });
    }

    // Verificar permiso (Solo Admin ve todo, otros deben estar asignados)
    if (user.fk_id_rol !== 1) {
      const [assignment] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM USUARIO_LABORATORIO WHERE FK_ID_USUARIO = ? AND FK_ID_LABORATORIO = ?',
        [user.id_usuario, idproyecto]
      );
      if (assignment.length === 0) {
        return res.status(403).json({ message: 'No tienes permiso para ver este laboratorio' });
      }
    }

    const [rows] = await pool.query<RowDataPacket[]>('CALL OBTENER_ESPACIOS_TRABAJO(?)', [idproyecto]);
    const espaciosTrabajo = rows[0] || [];
    res.json(espaciosTrabajo);
  } catch (error) {
    console.error('Error al obtener espacios de trabajo:', error);
    res.status(500).json({ message: 'Error al obtener espacios de trabajo' });
  }
};

// Crear espacio de trabajo
export const CREAR_ESPACIO_TRABAJO = async (req: Request, res: Response) => {
  try {
    const { idproyecto, nombre, descripcion } = req.body;
    const user = (req as any).user;

    // Verificar permiso
    if (user.fk_id_rol !== 1) {
      const [assignment] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM USUARIO_LABORATORIO WHERE FK_ID_USUARIO = ? AND FK_ID_LABORATORIO = ?',
        [user.id_usuario, idproyecto]
      );
      if (assignment.length === 0) {
        return res.status(403).json({ message: 'No tienes permiso para crear espacios de trabajo en este proyecto   ' });
      }
    }

    const [result] = await pool.query<RowDataPacket[]>(
      'CALL CREAR_ESPACIO_TRABAJO(?, ?, ?)',
      [idproyecto, nombre, descripcion]
    );
    
    const insertId = result[0][0].insertId;

    const newEspacioTrabajo = {
      id: insertId,
      code: `EST-${String(insertId).padStart(3, '0')}`,
      nombre,
      descripcion,
      idproyecto,
      createdAt: new Date().toISOString(),
      devices: 0,
      sensors: 0
    };

    res.status(201).json({
      message: 'Espacio de trabajo creado correctamente',
      espacioTrabajo: newEspacioTrabajo
    });
  } catch (error) {
    console.error('Error al crear espacio de trabajo:', error);
    res.status(500).json({ message: 'Error al crear espacio de trabajo' });
  }
};

// Actualizar espacio de trabajo
export const ACTUALIZAR_ESPACIO_TRABAJO = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    await pool.query(
      'CALL ACTUALIZAR_ESPACIO_TRABAJO(?, ?, ?)',
      [id, nombre, descripcion]
    );

    res.json({ message: 'Espacio de trabajo actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar espacio de trabajo:', error);
    res.status(500).json({ message: 'Error al actualizar espacio de trabajo' });
  }
};

// Eliminar espacio de trabajo
export const ELIMINAR_ESPACIO_TRABAJO = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query('CALL ELIMINAR_ESPACIO_TRABAJO(?)', [id]);

    res.json({ message: 'Espacio de trabajo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar espacio de trabajo:', error);
    res.status(500).json({ message: 'Error al eliminar espacio de trabajo' });
  }
};
