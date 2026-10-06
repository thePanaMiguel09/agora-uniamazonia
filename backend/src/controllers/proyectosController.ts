import { pool } from '../config/db';
import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Listar proyectos de un módulo
export const getProyectos = async (req: Request, res: Response) => {
  try {
    const { idproyecto } = req.params;
    const user = (req as any).user;
    
    if (!idproyecto) {
      return res.status(400).json({ message: 'El parámetro idproyecto es requerido' });
    }

    // Verificar permiso via Módulo -> Laboratorio
    if (user.fk_id_rol !== 1) {
      const [modulo] = await pool.query<RowDataPacket[]>(
        'SELECT FK_ID_LABORATORIO FROM MODULO WHERE ID_MODULO = ?',
        [idproyecto]
      );
      if (modulo.length > 0) {
        const idLab = modulo[0].FK_ID_LABORATORIO;
        const [assignment] = await pool.query<RowDataPacket[]>(
          'SELECT * FROM USUARIO_LABORATORIO WHERE FK_ID_USUARIO = ? AND FK_ID_LABORATORIO = ?',
          [user.id_usuario, idLab]
        );
        if (assignment.length === 0) {
          return res.status(403).json({ message: 'No tienes permiso para ver los proyectos de este laboratorio' });
        }
      }
    }

    const [rows] = await pool.query<RowDataPacket[]>('CALL OBTENER_PROYECTOS(?)', [idproyecto]);
    const proyectos = rows[0] || [];
    res.json(proyectos);
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({ message: 'Error al obtener proyectos' });
  }
};

// Crear proyecto
export const createProyecto = async (req: Request, res: Response) => {
  try {
    const { idproyecto, nombre, descripcion } = req.body;
    const user = (req as any).user;

    // Verificar permiso
    if (user.fk_id_rol !== 1) {
      const [modulo] = await pool.query<RowDataPacket[]>(
        'SELECT FK_ID_LABORATORIO FROM MODULO WHERE ID_MODULO = ?',
        [idproyecto]
      );
      if (modulo.length > 0) {
        const idLab = modulo[0].FK_ID_LABORATORIO;
        const [assignment] = await pool.query<RowDataPacket[]>(
          'SELECT * FROM USUARIO_LABORATORIO WHERE FK_ID_USUARIO = ? AND FK_ID_LABORATORIO = ?',
          [user.id_usuario, idLab]
        );
        if (assignment.length === 0) {
          return res.status(403).json({ message: 'No tienes permiso para crear proyectos en este laboratorio' });
        }
      }
    }

    const [result] = await pool.query<RowDataPacket[]>(
      'CALL CREAR_PROYECTO(?, ?, ?)',
      [idproyecto, nombre, descripcion]
    );
    
    const insertId = result[0][0].insertId;

    const newProyecto = {
      id: insertId,
      code: `PROY-${String(insertId).padStart(3, '0')}`,
      nombre,
      descripcion,
      idproyecto,
      createdAt: new Date().toISOString(),
      devices: 0,
      sensors: 0
    };

    res.status(201).json({
      message: 'Proyecto creado correctamente',
      proyecto: newProyecto
    });
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    res.status(500).json({ message: 'Error al crear proyecto' });
  }
};

// Actualizar proyecto
export const updateProyecto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    await pool.query(
      'CALL ACTUALIZAR_PROYECTO(?, ?, ?)',
      [id, nombre, descripcion]
    );

    res.json({ message: 'Proyecto actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    res.status(500).json({ message: 'Error al actualizar proyecto' });
  }
};

// Eliminar proyecto
export const deleteProyecto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query('CALL ELIMINAR_PROYECTO(?)', [id]);

    res.json({ message: 'Proyecto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    res.status(500).json({ message: 'Error al eliminar proyecto' });
  }
};
