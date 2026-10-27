import { Request, Response } from "express";
import * as authService from "../services/authService";

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Autenticar usuario en el sistema
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Autenticación exitosa. Retorna el token JWT.
 *       400:
 *         description: El usuario y la contraseña son obligatorios.
 *       401:
 *         description: Credenciales inválidas.
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "El usuario y la contraseña son obligatorios." });
    }

    const result = await authService.login(username, password);
    return res.status(200).json(result);
  } catch (error: unknown) {
    console.error(" Error en la autenticación:", error);
    const message =
      error instanceof Error ? error.message : "Usuario o contraseña inválidos";
    return res.status(401).json({ error: message });
  }
};

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_completo
 *               - username
 *               - password
 *               - fk_id_rol
 *               - email
 *             properties:
 *               nombre_completo:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               fk_id_rol:
 *                 type: integer
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente.
 *       400:
 *         description: Faltan campos obligatorios o error en el registro.
 */
export const registerUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { nombre_completo, username, password, fk_id_rol, email } = req.body;

    if (!nombre_completo || !username || !password || !fk_id_rol || !email) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios para el registro." });
    }

    const result = await authService.registerUser(
      nombre_completo,
      username,
      password,
      fk_id_rol,
      email,
    );
    return res.status(201).json(result);
  } catch (error: unknown) {
    console.error(" Error en el registro:", error);
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo completar el registro del usuario";
    return res.status(400).json({ error: message });
  }
};
