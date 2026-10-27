import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import { pool } from "../config/db";

/**
 * @openapi
 * /api/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios registrados
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida con éxito.
 */
export const getUsers = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const [rows] = await pool.query<RowDataPacket[][]>(
      "CALL OBTENER_USUARIOS()",
    );
    const users = rows[0] || [];

    return res.status(200).json(users);
  } catch (error: unknown) {
    console.error(" Error al obtener usuarios:", error);
    const message =
      error instanceof Error ? error.message : "Error al obtener los usuarios";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar un usuario por su ID
 *     tags: [Usuarios]
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
 *         description: Usuario eliminado correctamente.
 */
export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ error: "El ID del usuario es obligatorio." });
    }

    await pool.query("CALL ELIMINAR_USUARIO(?)", [id]);

    return res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error: unknown) {
    console.error(" Error al eliminar usuario:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Error interno al eliminar usuario";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar información de un usuario
 *     tags: [Usuarios]
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
 *               - nombre_completo
 *               - username
 *               - email
 *               - fk_id_rol
 *             properties:
 *               nombre_completo:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [activo, inactivo]
 *               fk_id_rol:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente.
 */
export const updateUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { nombre_completo, username, email, estado, fk_id_rol } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ error: "El ID del usuario es obligatorio." });
    }

    if (!nombre_completo || !username || !email || !fk_id_rol) {
      return res
        .status(400)
        .json({
          error: "Faltan campos obligatorios para actualizar el usuario.",
        });
    }

    const estadoNumerico = estado === "activo" ? 1 : 0;

    await pool.query("CALL ACTUALIZAR_USUARIO(?, ?, ?, ?, ?, ?)", [
      id,
      nombre_completo,
      username,
      email,
      estadoNumerico,
      fk_id_rol,
    ]);

    return res
      .status(200)
      .json({ message: "Usuario actualizado correctamente" });
  } catch (error: unknown) {
    console.error(" Error al actualizar usuario:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Error interno al actualizar usuario";
    return res.status(500).json({ error: message });
  }
};
