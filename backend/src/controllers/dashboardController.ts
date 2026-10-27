import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import { pool } from "../config/db";

/**
 * @openapi
 * /api/dashboard/stats:
 *   get:
 *     summary: Obtener estadísticas generales del dashboard
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas correctamente.
 *       500:
 *         description: Error interno del servidor.
 */
export const getStats = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const [rows] = await pool.query<RowDataPacket[][]>(
      "CALL OBTENER_ESTADISTICAS_DASHBOARD()",
    );
    const stats = rows[0]?.[0] || null;

    return res.status(200).json(stats);
  } catch (error: unknown) {
    console.error(" Error al obtener estadísticas del dashboard:", error);
    const message =
      error instanceof Error ? error.message : "Error al obtener estadísticas";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/dashboard/alerts:
 *   get:
 *     summary: Obtener todas las alertas del sistema
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alertas obtenida correctamente.
 *       500:
 *         description: Error interno del servidor.
 */
export const getAlerts = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const [rows] = await pool.query<RowDataPacket[][]>(
      "CALL OBTENER_TODAS_LAS_ALERTAS()",
    );
    const alerts = rows[0] || [];

    return res.status(200).json(alerts);
  } catch (error: unknown) {
    console.error(" Error al obtener alertas del dashboard:", error);
    const message =
      error instanceof Error ? error.message : "Error al obtener alertas";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Obtener la actividad reciente del sistema
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de actividades recientes obtenida correctamente.
 *       500:
 *         description: Error interno del servidor.
 */
export const getRecentActivity = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const [rows] = await pool.query<RowDataPacket[][]>(
      "CALL OBTENER_ACTIVIDAD_RECIENTE()",
    );
    const activities = rows[0] || [];

    return res.status(200).json(activities);
  } catch (error: unknown) {
    console.error(" Error al obtener actividad reciente:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener actividad reciente";
    return res.status(500).json({ error: message });
  }
};
