import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import { pool } from "../config/db";

interface AuthenticatedRequest extends Request {
  user?: {
    id_usuario: number;
    fk_id_rol: number;
    [key: string]: unknown;
  };
}

/**
 * @openapi
 * /api/laboratorios:
 *   get:
 *     summary: Listar laboratorios según permisos del usuario
 *     tags: [Laboratorios]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de laboratorios obtenida correctamente.
 */
export const getLaboratorios = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> => {
  try {
    const user = req.user;

    if (!user) {
      return res
        .status(401)
        .json({ error: "No autorizado. Usuario no autenticado." });
    }

    let laboratorios;

    if (user.fk_id_rol === 1) {
      const [rows] = await pool.query<RowDataPacket[][]>(
        "CALL OBTENER_LABORATORIOS()",
      );
      const rawLabs = rows[0] || [];

      laboratorios = rawLabs.map((lab: any) => ({
        ...lab,
        activeSensors: 0,
        devices: 0,
      }));
    } else {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
          L.ID_LABORATORIO as id,
          CONCAT('LAB-', LPAD(L.ID_LABORATORIO, 3, '0')) as code,
          L.NOMBRE_LABORATORIO as name,
          L.DESCRIPCION_LABORATORIO as description,
          EL.NOMBRE_ESTADO_LABORATORIO as status_db,
          (SELECT COUNT(*) FROM USUARIO_LABORATORIO WHERE FK_ID_LABORATORIO = L.ID_LABORATORIO) as associatedUsers,
          0 as activeSensors,
          0 as devices
         FROM LABORATORIO L
         JOIN ESTADO_LABORATORIO EL ON L.PK_ID_ESTADO_LABORATORIO = EL.ID_ESTADO_LABORATORIO
         JOIN USUARIO_LABORATORIO UL ON L.ID_LABORATORIO = UL.FK_ID_LABORATORIO
         WHERE UL.FK_ID_USUARIO = ?`,
        [user.id_usuario],
      );

      laboratorios = rows.map((lab: any) => ({
        ...lab,
        status:
          lab.status_db === "ACTIVO"
            ? "active"
            : lab.status_db === "MANTENIMIENTO"
              ? "maintenance"
              : "inactive",
        automationStatus: "off",
        isZoneDisabled: false,
      }));
    }

    return res.status(200).json(laboratorios);
  } catch (error: unknown) {
    console.error(" Error al obtener laboratorios:", error);
    const message =
      error instanceof Error ? error.message : "Error al obtener laboratorios";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/laboratorios:
 *   post:
 *     summary: Crear un nuevo laboratorio
 *     tags: [Laboratorios]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, maintenance, inactive]
 *     responses:
 *       201:
 *         description: Laboratorio creado correctamente.
 */
export const createLaboratorio = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { name, description, status } = req.body;

    if (!name || !status) {
      return res
        .status(400)
        .json({
          error: "El nombre y el estado del laboratorio son obligatorios.",
        });
    }

    const estadoId = status === "active" ? 1 : status === "maintenance" ? 2 : 3;

    const [result] = await pool.query<RowDataPacket[][]>(
      "CALL CREAR_LABORATORIO(?, ?, ?)",
      [name, description || null, estadoId],
    );

    const insertId =
      result[0]?.[0]?.insertId || result[0]?.[0]?.ID_LABORATORIO || 0;

    const newLab = {
      id: insertId,
      code: `LAB-${String(insertId).padStart(3, "0")}`,
      name,
      description,
      temperature: 23.5,
      humidity: 45,
      status,
      associatedUsers: 0,
      createdAt: new Date().toISOString(),
      automationStatus: "on" as "on" | "off",
      isZoneDisabled: false,
      activeSensors: 0,
      devices: 0,
    };

    return res.status(201).json({
      message: "Laboratorio creado correctamente",
      laboratorio: newLab,
    });
  } catch (error: unknown) {
    console.error(" Error al crear laboratorio:", error);
    const message =
      error instanceof Error ? error.message : "Error al crear laboratorio";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/laboratorios/{id}:
 *   put:
 *     summary: Actualizar un laboratorio existente
 *     tags: [Laboratorios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Laboratorio actualizado correctamente.
 */
export const updateLaboratorio = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const user = req.user;

    if (!id || !name || !status) {
      return res
        .status(400)
        .json({ error: "El ID, nombre y estado son obligatorios." });
    }

    if (!user) {
      return res
        .status(401)
        .json({ error: "No autorizado. Usuario no autenticado." });
    }

    if (user.fk_id_rol !== 1) {
      const [assignment] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM USUARIO_LABORATORIO WHERE FK_ID_USUARIO = ? AND FK_ID_LABORATORIO = ?",
        [user.id_usuario, id],
      );
      if (assignment.length === 0) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para editar este laboratorio." });
      }
    }

    const estadoId = status === "active" ? 1 : status === "maintenance" ? 2 : 3;

    await pool.query("CALL ACTUALIZAR_LABORATORIO(?, ?, ?, ?)", [
      id,
      name,
      description || null,
      estadoId,
    ]);

    return res
      .status(200)
      .json({ message: "Laboratorio actualizado correctamente" });
  } catch (error: unknown) {
    console.error(" Error al actualizar laboratorio:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Error al actualizar laboratorio";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/laboratorios/{id}:
 *   delete:
 *     summary: Eliminar un laboratorio
 *     tags: [Laboratorios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Laboratorio eliminado correctamente.
 */
export const deleteLaboratorio = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ error: "El ID del laboratorio es obligatorio." });
    }

    await pool.query("CALL ELIMINAR_LABORATORIO(?)", [id]);

    return res
      .status(200)
      .json({ message: "Laboratorio eliminado correctamente" });
  } catch (error: unknown) {
    console.error(" Error al eliminar laboratorio:", error);
    const message =
      error instanceof Error ? error.message : "Error al eliminar laboratorio";
    return res.status(500).json({ error: message });
  }
};
