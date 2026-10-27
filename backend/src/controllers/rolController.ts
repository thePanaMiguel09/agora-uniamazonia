import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import { pool } from "../config/db";

/**
 * @openapi
 * /api/roles:
 *   get:
 *     summary: Obtener todos los roles disponibles en el sistema
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles obtenida con éxito.
 */
export const getRoles = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const [rows] = await pool.query<RowDataPacket[][]>("CALL OBTENER_ROLES()");
    const rawRoles = rows[0] || [];

    const roles = rawRoles.map((rol: RowDataPacket) => ({
      id_rol: rol.ID_ROL ?? rol.id_rol,
      nombre_rol: rol.NOMBRE_ROL ?? rol.nombre_rol,
    }));

    return res.status(200).json(roles);
  } catch (error: unknown) {
    console.error(" Error al obtener roles:", error);
    const message =
      error instanceof Error ? error.message : "Error al obtener los roles";
    return res.status(500).json({ error: message });
  }
};
