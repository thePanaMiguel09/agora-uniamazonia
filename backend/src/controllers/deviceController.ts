import { Request, Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET devices for Laboratory (Cámaras y Aires Acondicionados)
export const getLaboratoryDevices = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [camaras] = await pool.query<RowDataPacket[]>(
      'SELECT ID_CAMARA as id, NOMBRE_CAMARA as name, URL_STREAM as url, ESTADO_CAMARA as status, "camera" as type FROM camara WHERE FK_ID_LABORATORIO = ?',
      [id]
    );

    const [aires] = await pool.query<RowDataPacket[]>(
      'SELECT ID_CONTROLADOR_AIRE as id, NOMBRE_CONTROLADOR_AIRE as name, TEMPERATURA_OBJETIVO_CONTROLADOR_AIRE as targetTemp, ESTADO_CONTROLADOR_AIRE as status, "air-conditioner" as type FROM controlador_aire WHERE FK_ID_LABORATORIO = ?',
      [id]
    );

    res.json([...camaras, ...aires]);
  } catch (error) {
    console.error('Error getting laboratory devices:', error);
    res.status(500).json({ message: 'Error retrieving devices' });
  }
};

// POST device for Laboratory
export const createLaboratoryDevice = async (req: Request, res: Response) => {
  try {
    const { type, name, fk_id_laboratorio } = req.body;

    if (type === 'camera') {
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO camara (NOMBRE_CAMARA, URL_STREAM, FK_ID_LABORATORIO, ESTADO_CAMARA) VALUES (?, ?, ?, ?)',
        [name, 'rtsp://mock.stream', fk_id_laboratorio, 1]
      );
      res.json({ id: result.insertId, type: 'camera', name });
    } else if (type === 'air-conditioner') {
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO controlador_aire (NOMBRE_CONTROLADOR_AIRE, TEMPERATURA_OBJETIVO_CONTROLADOR_AIRE, ESTADO_CONTROLADOR_AIRE, FK_ID_LABORATORIO) VALUES (?, ?, ?, ?)',
        [name, 24.0, 0, fk_id_laboratorio]
      );
      res.json({ id: result.insertId, type: 'air-conditioner', name });
    } else {
      res.status(400).json({ message: 'Invalid device type for laboratory' });
    }
  } catch (error) {
    console.error('Error creating laboratory device:', error);
    res.status(500).json({ message: 'Error creating device' });
  }
};

// DELETE device for Laboratory
export const deleteLaboratoryDevice = async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;
    
    if (type === 'camera') {
      await pool.query('DELETE FROM camara WHERE ID_CAMARA = ?', [id]);
    } else if (type === 'air-conditioner') {
      await pool.query('DELETE FROM controlador_aire WHERE ID_CONTROLADOR_AIRE = ?', [id]);
    }
    
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Error deleting laboratory device:', error);
    res.status(500).json({ message: 'Error deleting device' });
  }
};

// GET devices for Espacio Trabajo (Luces y Válvulas y Sensores)
export const getEspacioTrabajoDevices = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [actuadores] = await pool.query<RowDataPacket[]>(
      `SELECT ID_ACTUADOR as id, NOMBRE_ACTUADOR as name, 
       IF(FK_ID_TIPO_ACTUADOR = 1, 'valve', IF(FK_ID_TIPO_ACTUADOR = 3, 'light', 'fan')) as type,
       FK_ID_ESPACIO_TRABAJO as fk_id_espacio_trabajo
       FROM actuador 
       WHERE FK_ID_ESPACIO_TRABAJO = ?`,
      [id]
    );

    const [sensores] = await pool.query<RowDataPacket[]>(
      `SELECT ID_SENSOR as id, NOMBRE_SENSOR as name, 
       IF(FK_ID_TIPO_SENSOR = 1, 'temperature', IF(FK_ID_TIPO_SENSOR = 2, 'humidity', 'ph')) as type,
       FK_ID_ESPACIO_TRABAJO as fk_id_espacio_trabajo
       FROM sensor 
       WHERE FK_ID_ESPACIO_TRABAJO = ?`,
      [id]
    );

    res.json([...actuadores, ...sensores]);
  } catch (error) {
    console.error('Error getting espacio trabajo devices:', error);
    res.status(500).json({ message: 'Error retrieving devices' });
  }
};

// POST device for Espacio Trabajo
export const createEspacioTrabajoDevice = async (req: Request, res: Response) => {
  try {
    const { type, name, fk_id_espacio_trabajo } = req.body;
    
    // Actuators
    if (['valve', 'light', 'fan'].includes(type)) {
      let tipoId = 0;
      if (type === 'valve') tipoId = 1;
      else if (type === 'light') tipoId = 3;
      else if (type === 'fan') tipoId = 2;

      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO actuador (NOMBRE_ACTUADOR, FK_ID_TIPO_ACTUADOR, FK_ID_ESTADO_DISPOSITIVO, FK_ID_ESPACIO_TRABAJO) VALUES (?, ?, ?, ?)',
        [name, tipoId, 1, fk_id_espacio_trabajo]
      );
      return res.json({ id: result.insertId, type, name, fk_id_espacio_trabajo });
    }
    
    // Sensors
    if (['temperature', 'humidity', 'ph'].includes(type)) {
      let tipoId = 0;
      if (type === 'temperature') tipoId = 1;
      else if (type === 'humidity') tipoId = 2;
      else if (type === 'ph') tipoId = 3;

      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO sensor (NOMBRE_SENSOR, FK_ID_TIPO_SENSOR, FK_ID_ESTADO_DISPOSITIVO, FK_ID_ESPACIO_TRABAJO) VALUES (?, ?, ?, ?)',
        [name, tipoId, 1, fk_id_espacio_trabajo]
      );
      return res.json({ id: result.insertId, type, name, fk_id_espacio_trabajo });
    }

    return res.status(400).json({ message: 'Invalid device type for espacio trabajo' });
  } catch (error) {
    console.error('Error creating espacio trabajo device:', error);
    res.status(500).json({ message: 'Error creating device' });
  }
};

// DELETE device from Espacio Trabajo
export const deleteEspacioTrabajoDevice = async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;
    if (['valve', 'light', 'fan'].includes(type)) {
      await pool.query('DELETE FROM actuador WHERE ID_ACTUADOR = ?', [id]);
    } else if (['temperature', 'humidity', 'ph'].includes(type)) {
      await pool.query('DELETE FROM sensor WHERE ID_SENSOR = ?', [id]);
    } else {
      return res.status(400).json({ message: 'Invalid device type' });
    }
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ message: 'Error deleting device' });
  }
};

// GET pumps (bombas/valves) for a given Modulo
export const getBombasByModulo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [bombas] = await pool.query<RowDataPacket[]>(
      `SELECT a.ID_ACTUADOR as id, a.NOMBRE_ACTUADOR as name, 'valve' as type, e.NOMBRE_ESPACIO_TRABAJO as shelfName
       FROM actuador a
       JOIN espacio_trabajo e ON a.FK_ID_ESPACIO_TRABAJO = e.ID_ESPACIO_TRABAJO
       JOIN proyecto p ON e.FK_ID_PROYECTO = p.ID_PROYECTO
       WHERE p.FK_ID_MODULO = ? AND a.FK_ID_TIPO_ACTUADOR = 1`,
      [id]
    );

    res.json(bombas);
  } catch (error) {
    console.error('Error getting bombas for modulo:', error);
    res.status(500).json({ message: 'Error retrieving bombas' });
  }
};

// GET all espacios_trabajo for a given Modulo (used for dropdown when creating a bomb in Projects view)
export const getEstantesByModulo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [estantes] = await pool.query<RowDataPacket[]>(
      `SELECT e.ID_ESPACIO_TRABAJO as id, e.NOMBRE_ESPACIO_TRABAJO as name, p.NOMBRE_PROYECTO as projectName
       FROM espacio_trabajo e
       JOIN proyecto p ON e.FK_ID_PROYECTO = p.ID_PROYECTO
       WHERE p.FK_ID_MODULO = ?`,
      [id]
    );

    res.json(estantes);
  } catch (error) {
    console.error('Error getting estantes for modulo:', error);
    res.status(500).json({ message: 'Error retrieving estantes' });
  }
};
