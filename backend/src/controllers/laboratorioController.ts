import { pool } from '../config/db';
import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// ✅ Listar laboratorios
export const getLaboratorios = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let laboratorios;

    if (user.fk_id_rol === 1) {
      // ADMIN ve todo
      const [rows] = await pool.query<RowDataPacket[]>('CALL OBTENER_LABORATORIOS()');
      laboratorios = rows[0].map((lab: any) => ({
        ...lab,
        activeSensors: 0, // Removes the hardcoded 36 from SP
        devices: 0
      }));
    } else {
      // Supervisor y Operador ven solo lo asignado
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          L.ID_LABORATORIO as id,
          CONCAT('LAB-', LPAD(L.ID_LABORATORIO, 3, '0')) as code,
          L.NOMBRE_LABORATORIO as name,
          L.DESCRIPCION_LABORATORIO as description,
          EL.NOMBRE_ESTADO_LABORATORIO as status_db,
          (SELECT COUNT(*) FROM USUARIO_LABORATORIO WHERE FK_ID_LABORATORIO = L.ID_LABORATORIO) as associatedUsers,
          0 as activeSensors, -- Simplificado por ahora
          0 as devices
         FROM LABORATORIO L
         JOIN ESTADO_LABORATORIO EL ON L.PK_ID_ESTADO_LABORATORIO = EL.ID_ESTADO_LABORATORIO
         JOIN USUARIO_LABORATORIO UL ON L.ID_LABORATORIO = UL.FK_ID_LABORATORIO
         WHERE UL.FK_ID_USUARIO = ?`,
        [user.id_usuario]
      );
      
      laboratorios = rows.map(lab => ({
        ...lab,
        status: lab.status_db === 'ACTIVO' ? 'active' : lab.status_db === 'MANTENIMIENTO' ? 'maintenance' : 'inactive',
        automationStatus: 'off',
        isZoneDisabled: false
      }));
    }

    res.json(laboratorios);
  } catch (error) {
    console.error('Error al obtener laboratorios:', error);
    res.status(500).json({ message: 'Error al obtener laboratorios' });
  }
};

// ✅ Crear laboratorio
export const createLaboratorio = async (req: Request, res: Response) => {
  try {
    const { name, description, status } = req.body;
    // Map status to estadoId
    const estadoId = status === 'active' ? 1 : status === 'maintenance' ? 2 : 3;

    const [result] = await pool.query<RowDataPacket[]>(
      'CALL CREAR_LABORATORIO(?, ?, ?)',
      [name, description, estadoId]
    );
    
    const insertId = result[0][0].insertId;

    const newLab = {
      id: insertId,
      code: `LAB-${String(insertId).padStart(3, '0')}`,
      name,
      description,
      temperature: 23.5,
      humidity: 45,
      status,
      associatedUsers: 0,
      createdAt: new Date().toISOString(),
      automationStatus: 'on' as 'on' | 'off',
      isZoneDisabled: false,
      activeSensors: 0,
      devices: 0
    };

    res.status(201).json({
      message: 'Laboratorio creado correctamente',
      laboratorio: newLab
    });
  } catch (error) {
    console.error('Error al crear laboratorio:', error);
    res.status(500).json({ message: 'Error al crear laboratorio' });
  }
};

// ✅ Actualizar laboratorio
export const updateLaboratorio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const user = (req as any).user;

    // Verificar si el supervisor tiene asignado este laboratorio
    if (user.fk_id_rol !== 1) {
      const [assignment] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM USUARIO_LABORATORIO WHERE FK_ID_USUARIO = ? AND FK_ID_LABORATORIO = ?',
        [user.id_usuario, id]
      );
      if (assignment.length === 0) {
        return res.status(403).json({ message: 'No tienes permiso para editar este laboratorio' });
      }
    }

    const estadoId = status === 'active' ? 1 : status === 'maintenance' ? 2 : 3;

    await pool.query(
      'CALL ACTUALIZAR_LABORATORIO(?, ?, ?, ?)',
      [id, name, description, estadoId]
    );

    res.json({ message: 'Laboratorio actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar laboratorio:', error);
    res.status(500).json({ message: 'Error al actualizar laboratorio' });
  }
};

// ✅ Eliminar laboratorio
export const deleteLaboratorio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query('CALL ELIMINAR_LABORATORIO(?)', [id]);

    res.json({ message: 'Laboratorio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar laboratorio:', error);
    res.status(500).json({ message: 'Error al eliminar laboratorio' });
  }
};
