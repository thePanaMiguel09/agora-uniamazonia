import { pool } from '../config/db';
import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';

export const getStats = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('CALL OBTENER_ESTADISTICAS_DASHBOARD()');
    const stats = rows[0][0]; // Extract the first row of the first result set
    
    // Calcular total de dispositivos reales
    const [[{ act }]] = await pool.query<any>('SELECT COUNT(*) as act FROM ACTUADOR');
    const [[{ cam }]] = await pool.query<any>('SELECT COUNT(*) as cam FROM CAMARA_SEGURIDAD');
    const [[{ ca }]] = await pool.query<any>('SELECT COUNT(*) as ca FROM CONTROLADOR_AIRE');
    
    stats.totalDevices = Number(act) + Number(cam) + Number(ca);
    stats.activeSensors = 0; // Se remueve el dato quemado (antes era 36)
    
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('CALL OBTENER_TODAS_LAS_ALERTAS()');
    const alerts = rows[0];
    res.json(alerts);
  } catch (error) {
    console.error('Error al obtener alertas del dashboard:', error);
    res.status(500).json({ message: 'Error al obtener alertas' });
  }
};

export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('CALL OBTENER_ACTIVIDAD_RECIENTE()');
    const activities = rows[0];
    res.json(activities);
  } catch (error) {
    console.error('Error al obtener actividad reciente:', error);
    res.status(500).json({ message: 'Error al obtener actividad reciente' });
  }
};
