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
 * /api/laboratorios/{idlaboratorio}/modulos:
 *   get:
 *     summary: Listar módulos asociados a un laboratorio
 *     tags: [Módulos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idlaboratorio
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de módulos obtenida con éxito.
 */
export const getModulos = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { idlaboratorio } = req.params;
    const user = req.user;

    if (!idlaboratorio) {
      return res
        .status(400)
        .json({ error: "El parámetro idlaboratorio es requerido." });
    }

    if (!user) {
      return res
        .status(401)
        .json({ error: "No autorizado. Usuario no autenticado." });
    }

    if (user.fk_id_rol !== 1) {
      const [assignment] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM USUARIO_LABORATORIO WHERE FK_ID_USUARIO = ? AND FK_ID_LABORATORIO = ?",
        [user.id_usuario, idlaboratorio],
      );
      if (assignment.length === 0) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para ver este laboratorio." });
      }
    }

    const [rows] = await pool.query<RowDataPacket[][]>(
      "CALL OBTENER_MODULOS(?)",
      [idlaboratorio],
    );
    const modulos = rows[0] || [];

    return res.status(200).json(modulos);
  } catch (error: unknown) {
    console.error(" Error al obtener módulos:", error);
    const message =
      error instanceof Error ? error.message : "Error al obtener módulos";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/modulos:
 *   post:
 *     summary: Crear un nuevo módulo
 *     tags: [Módulos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idlaboratorio
 *               - nombre
 *             properties:
 *               idlaboratorio:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Módulo creado correctamente.
 */
export const createModulo = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { idlaboratorio, nombre, descripcion } = req.body;
    const user = req.user;

    if (!idlaboratorio || !nombre) {
      return res
        .status(400)
        .json({ error: "El ID del laboratorio y el nombre son obligatorios." });
    }

    if (!user) {
      return res
        .status(401)
        .json({ error: "No autorizado. Usuario no autenticado." });
    }

    if (user.fk_id_rol !== 1) {
      const [assignment] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM USUARIO_LABORATORIO WHERE FK_ID_USUARIO = ? AND FK_ID_LABORATORIO = ?",
        [user.id_usuario, idlaboratorio],
      );
      if (assignment.length === 0) {
        return res
          .status(403)
          .json({
            error: "No tienes permiso para crear módulos en este laboratorio.",
          });
      }
    }

    const [result] = await pool.query<RowDataPacket[][]>(
      "CALL CREAR_MODULO(?, ?, ?)",
      [idlaboratorio, nombre, descripcion || null],
    );

    const insertId = result[0]?.[0]?.insertId || result[0]?.[0]?.ID_MODULO || 0;

    const newModulo = {
      id: insertId,
      code: `MOD-${String(insertId).padStart(3, "0")}`,
      nombre,
      descripcion,
      idlaboratorio,
      createdAt: new Date().toISOString(),
      devices: 0,
      sensors: 0,
    };

    return res.status(201).json({
      message: "Módulo creado correctamente",
      modulo: newModulo,
    });
  } catch (error: unknown) {
    console.error(" Error al crear módulo:", error);
    const message =
      error instanceof Error ? error.message : "Error al crear módulo";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/modulos/{id}:
 *   put:
 *     summary: Actualizar un módulo
 *     tags: [Módulos]
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
 *         description: Módulo actualizado correctamente.
 */
export const updateModulo = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    if (!id || !nombre) {
      return res
        .status(400)
        .json({ error: "El ID y el nombre del módulo son obligatorios." });
    }

    await pool.query("CALL ACTUALIZAR_MODULO(?, ?, ?)", [
      id,
      nombre,
      descripcion || null,
    ]);

    return res
      .status(200)
      .json({ message: "Módulo actualizado correctamente" });
  } catch (error: unknown) {
    console.error(" Error al actualizar módulo:", error);
    const message =
      error instanceof Error ? error.message : "Error al actualizar módulo";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/modulos/{id}:
 *   delete:
 *     summary: Eliminar un módulo
 *     tags: [Módulos]
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
 *         description: Módulo eliminado correctamente.
 */
export const deleteModulo = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ error: "El ID del módulo es obligatorio." });
    }

    await pool.query("CALL ELIMINAR_MODULO(?)", [id]);

    return res.status(200).json({ message: "Módulo eliminado correctamente" });
  } catch (error: unknown) {
    console.error(" Error al eliminar módulo:", error);
    const message =
      error instanceof Error ? error.message : "Error al eliminar módulo";
    return res.status(500).json({ error: message });
  }
};
