import { pool } from '../config/db';
import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Listar módulos de un laboratorio
export const getModulos = async (req: Request, res: Response) => {
  try {
    const { idlaboratorio } = req.params;
    const user = (req as any).user;
    
    if (!idlaboratorio) {
      return res.status(400).json({ message: 'El parámetro idlaboratorio es requerido' });
    }

    // Verificar permiso (Solo Admin ve todo, otros deben estar asignados)
    if (user.fk_id_rol !== 1) {
      const [assignment] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM USUARIO_LABORATORIO WHERE FK_ID_USUARIO = ? AND FK_ID_LABORATORIO = ?',
        [user.id_usuario, idlaboratorio]
      );
      if (assignment.length === 0) {
        return res.status(403).json({ message: 'No tienes permiso para ver este laboratorio' });
      }
    }

    const [rows] = await pool.query<RowDataPacket[]>('CALL OBTENER_MODULOS(?)', [idlaboratorio]);
    const modulos = rows[0] || [];
    res.json(modulos);
  } catch (error) {
    console.error('Error al obtener módulos:', error);
    res.status(500).json({ message: 'Error al obtener módulos' });
  }
};

// Crear módulo
export const createModulo = async (req: Request, res: Response) => {
  try {
    const { idlaboratorio, nombre, descripcion } = req.body;
    const user = (req as any).user;

    // Verificar permiso
    if (user.fk_id_rol !== 1) {
      const [assignment] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM USUARIO_LABORATORIO WHERE FK_ID_USUARIO = ? AND FK_ID_LABORATORIO = ?',
        [user.id_usuario, idlaboratorio]
      );
      if (assignment.length === 0) {
        return res.status(403).json({ message: 'No tienes permiso para crear módulos en este laboratorio' });
      }
    }

    const [result] = await pool.query<RowDataPacket[]>(
      'CALL CREAR_MODULO(?, ? , ?)',
      [idlaboratorio, nombre, descripcion]
    );
    
    const insertId = result[0][0].insertId;

    const newModulo = {
      id: insertId,
      code: `MOD-${String(insertId).padStart(3, '0')}`,
      nombre,
      descripcion,
      idlaboratorio,
      createdAt: new Date().toISOString(),
      devices: 0,
      sensors: 0
    };

    res.status(201).json({
      message: 'Módulo creado correctamente',
      modulo: newModulo
    });
  } catch (error) {
    console.error('Error al crear módulo:', error);
    res.status(500).json({ message: 'Error al crear módulo' });
  }
};

// Actualizar módulo
export const updateModulo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    await pool.query(
      'CALL ACTUALIZAR_MODULO( ?, ?, ?)',
      [id,nombre, descripcion]
    );

    res.json({ message: 'Módulo actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar módulo:', error);
    res.status(500).json({ message: 'Error al actualizar módulo' });
  }
};

// Eliminar módulo
export const deleteModulo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query('CALL ELIMINAR_MODULO(?)', [id]);

    res.json({ message: 'Módulo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar módulo:', error);
    res.status(500).json({ message: 'Error al eliminar módulo' });
  }
};
