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
 * /api/modulos/{idproyecto}/proyectos:
 *   get:
 *     summary: Listar proyectos de un módulo
 *     tags: [Proyectos]
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
 *         description: Lista de proyectos obtenida con éxito.
 */
export const getProyectos = async (
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
      const [modulo] = await pool.query<RowDataPacket[]>(
        "SELECT FK_ID_LABORATORIO FROM MODULO WHERE ID_MODULO = ?",
        [idproyecto],
      );

      if (modulo.length > 0) {
        const idLab = modulo[0].FK_ID_LABORATORIO;
        const [assignment] = await pool.query<RowDataPacket[]>(
          "SELECT * FROM USUARIO_LABORATORIO WHERE FK_ID_USUARIO = ? AND FK_ID_LABORATORIO = ?",
          [user.id_usuario, idLab],
        );

        if (assignment.length === 0) {
          return res
            .status(403)
            .json({
              error:
                "No tienes permiso para ver los proyectos de este laboratorio.",
            });
        }
      }
    }

    const [rows] = await pool.query<RowDataPacket[][]>(
      "CALL OBTENER_PROYECTOS(?)",
      [idproyecto],
    );
    const proyectos = rows[0] || [];

    return res.status(200).json(proyectos);
  } catch (error: unknown) {
    console.error(" Error al obtener proyectos:", error);
    const message =
      error instanceof Error ? error.message : "Error al obtener proyectos";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/proyectos:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags: [Proyectos]
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
 *         description: Proyecto creado correctamente.
 */
export const createProyecto = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { idproyecto, nombre, descripcion } = req.body;
    const user = req.user;

    if (!idproyecto || !nombre) {
      return res
        .status(400)
        .json({
          error: "El ID del módulo y el nombre del proyecto son obligatorios.",
        });
    }

    if (!user) {
      return res
        .status(401)
        .json({ error: "No autorizado. Usuario no autenticado." });
    }

    if (user.fk_id_rol !== 1) {
      const [modulo] = await pool.query<RowDataPacket[]>(
        "SELECT FK_ID_LABORATORIO FROM MODULO WHERE ID_MODULO = ?",
        [idproyecto],
      );

      if (modulo.length > 0) {
        const idLab = modulo[0].FK_ID_LABORATORIO;
        const [assignment] = await pool.query<RowDataPacket[]>(
          "SELECT * FROM USUARIO_LABORATORIO WHERE FK_ID_USUARIO = ? AND FK_ID_LABORATORIO = ?",
          [user.id_usuario, idLab],
        );

        if (assignment.length === 0) {
          return res
            .status(403)
            .json({
              error:
                "No tienes permiso para crear proyectos en este laboratorio.",
            });
        }
      }
    }

    const [result] = await pool.query<RowDataPacket[][]>(
      "CALL CREAR_PROYECTO(?, ?, ?)",
      [idproyecto, nombre, descripcion || null],
    );

    const insertId =
      result[0]?.[0]?.insertId || result[0]?.[0]?.ID_PROYECTO || 0;

    const newProyecto = {
      id: insertId,
      code: `PROY-${String(insertId).padStart(3, "0")}`,
      nombre,
      descripcion,
      idproyecto,
      createdAt: new Date().toISOString(),
      devices: 0,
      sensors: 0,
    };

    return res.status(201).json({
      message: "Proyecto creado correctamente",
      proyecto: newProyecto,
    });
  } catch (error: unknown) {
    console.error(" Error al crear proyecto:", error);
    const message =
      error instanceof Error ? error.message : "Error al crear proyecto";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/proyectos/{id}:
 *   put:
 *     summary: Actualizar un proyecto
 *     tags: [Proyectos]
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
 *         description: Proyecto actualizado correctamente.
 */
export const updateProyecto = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    if (!id || !nombre) {
      return res
        .status(400)
        .json({ error: "El ID y el nombre del proyecto son obligatorios." });
    }

    await pool.query("CALL ACTUALIZAR_PROYECTO(?, ?, ?)", [
      id,
      nombre,
      descripcion || null,
    ]);

    return res
      .status(200)
      .json({ message: "Proyecto actualizado correctamente" });
  } catch (error: unknown) {
    console.error(" Error al actualizar proyecto:", error);
    const message =
      error instanceof Error ? error.message : "Error al actualizar proyecto";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/proyectos/{id}:
 *   delete:
 *     summary: Eliminar un proyecto
 *     tags: [Proyectos]
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
 *         description: Proyecto eliminado correctamente.
 */
export const deleteProyecto = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ error: "El ID del proyecto es obligatorio." });
    }

    await pool.query("CALL ELIMINAR_PROYECTO(?)", [id]);

    return res
      .status(200)
      .json({ message: "Proyecto eliminado correctamente" });
  } catch (error: unknown) {
    console.error(" Error al eliminar proyecto:", error);
    const message =
      error instanceof Error ? error.message : "Error al eliminar proyecto";
    return res.status(500).json({ error: message });
  }
};
