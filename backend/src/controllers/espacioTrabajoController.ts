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
 * /api/proyectos/{idproyecto}/espacios-trabajo:
 *   get:
 *     summary: Listar espacios de trabajo de un proyecto
 *     tags: [Espacios de Trabajo]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idproyecto
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista obtenida correctamente.
 *       403:
 *         description: Sin permisos para ver este laboratorio.
 */
export const OBTENER_ESPACIOS_TRABAJO = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { idproyecto } = req.params;
    const user = req.user;

    if (!idproyecto) {
      return res
        .status(400)
        .json({ error: "El parámetro idproyecto es requerido." });
    }

    if (!user) {
      return res
        .status(401)
        .json({ error: "No autorizado. Usuario no autenticado." });
    }

    if (user.fk_id_rol !== 1) {
      const [assignment] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM USUARIO_LABORATORIO WHERE FK_ID_USUARIO = ? AND FK_ID_LABORATORIO = ?",
        [user.id_usuario, idproyecto],
      );
      if (assignment.length === 0) {
        return res
          .status(403)
          .json({
            error: "No tienes permiso para ver este laboratorio o proyecto.",
          });
      }
    }

    const [rows] = await pool.query<RowDataPacket[][]>(
      "CALL OBTENER_ESPACIOS_TRABAJO(?)",
      [idproyecto],
    );
    const espaciosTrabajo = rows[0] || [];

    return res.status(200).json(espaciosTrabajo);
  } catch (error: unknown) {
    console.error(" Error al obtener espacios de trabajo:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener espacios de trabajo";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/espacios-trabajo:
 *   post:
 *     summary: Crear un espacio de trabajo
 *     tags: [Espacios de Trabajo]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idproyecto
 *               - nombre
 *             properties:
 *               idproyecto:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Espacio de trabajo creado correctamente.
 */
export const CREAR_ESPACIO_TRABAJO = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { idproyecto, nombre, descripcion } = req.body;
    const user = req.user;

    if (!idproyecto || !nombre) {
      return res
        .status(400)
        .json({ error: "El ID del proyecto y el nombre son obligatorios." });
    }

    if (!user) {
      return res
        .status(401)
        .json({ error: "No autorizado. Usuario no autenticado." });
    }

    if (user.fk_id_rol !== 1) {
      const [assignment] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM USUARIO_LABORATORIO WHERE FK_ID_USUARIO = ? AND FK_ID_LABORATORIO = ?",
        [user.id_usuario, idproyecto],
      );
      if (assignment.length === 0) {
        return res
          .status(403)
          .json({
            error:
              "No tienes permiso para crear espacios de trabajo en este proyecto.",
          });
      }
    }

    const [result] = await pool.query<RowDataPacket[][]>(
      "CALL CREAR_ESPACIO_TRABAJO(?, ?, ?)",
      [idproyecto, nombre, descripcion || null],
    );

    const insertId =
      result[0]?.[0]?.insertId || result[0]?.[0]?.ID_ESPACIO_TRABAJO || 0;

    const newEspacioTrabajo = {
      id: insertId,
      code: `EST-${String(insertId).padStart(3, "0")}`,
      nombre,
      descripcion,
      idproyecto,
      createdAt: new Date().toISOString(),
      devices: 0,
      sensors: 0,
    };

    return res.status(201).json({
      message: "Espacio de trabajo creado correctamente",
      espacioTrabajo: newEspacioTrabajo,
    });
  } catch (error: unknown) {
    console.error(" Error al crear espacio de trabajo:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Error al crear espacio de trabajo";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/espacios-trabajo/{id}:
 *   put:
 *     summary: Actualizar espacio de trabajo
 *     tags: [Espacios de Trabajo]
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
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Espacio de trabajo actualizado correctamente.
 */
export const ACTUALIZAR_ESPACIO_TRABAJO = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    if (!id || !nombre) {
      return res
        .status(400)
        .json({ error: "El ID y el nombre son obligatorios." });
    }

    await pool.query("CALL ACTUALIZAR_ESPACIO_TRABAJO(?, ?, ?)", [
      id,
      nombre,
      descripcion || null,
    ]);

    return res
      .status(200)
      .json({ message: "Espacio de trabajo actualizado correctamente" });
  } catch (error: unknown) {
    console.error(" Error al actualizar espacio de trabajo:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Error al actualizar espacio de trabajo";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/espacios-trabajo/{id}:
 *   delete:
 *     summary: Eliminar espacio de trabajo
 *     tags: [Espacios de Trabajo]
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
 *         description: Espacio de trabajo eliminado correctamente.
 */
export const ELIMINAR_ESPACIO_TRABAJO = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ error: "El ID del espacio de trabajo es obligatorio." });
    }

    await pool.query("CALL ELIMINAR_ESPACIO_TRABAJO(?)", [id]);

    return res
      .status(200)
      .json({ message: "Espacio de trabajo eliminado correctamente" });
  } catch (error: unknown) {
    console.error(" Error al eliminar espacio de trabajo:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Error al eliminar espacio de trabajo";
    return res.status(500).json({ error: message });
  }
};
