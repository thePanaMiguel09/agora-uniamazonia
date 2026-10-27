import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Joi from "joi";
import { pool } from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/**
 * Esquema de validación para el registro de usuarios.
 */
const registerSchema = Joi.object({
  nombre_completo: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  fk_id_rol: Joi.number().required(),
  email: Joi.string().email().required(),
});

/**
 * Esquema de validación para el inicio de sesión.
 */
const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

/**
 * Interfaz que representa la estructura de un usuario recuperado de la base de datos.
 */
interface User extends RowDataPacket {
  id_usuario: number;
  nombre_completo: string;
  username: string;
  password: string;
  fk_id_rol: number;
  email: string;
}

/**
 * Interfaz que define la estructura de la respuesta exitosa al iniciar sesión.
 */
export interface LoginResponse {
  token: string;
  user: {
    id_usuario: number;
    username: string;
    fk_id_rol: number;
  };
}

/**
 * Registra un nuevo usuario en el sistema, cifrando su contraseña y ejecutando validaciones previas.
 *
 * @param {string} nombre_completo - Nombre completo del usuario.
 * @param {string} username - Nombre de usuario único.
 * @param {string} password - Contraseña en texto plano.
 * @param {number} fk_id_rol - ID del rol asignado.
 * @param {string} email - Correo electrónico del usuario.
 * @returns {Promise<ResultSetHeader>} Resultado de la ejecución en la base de datos.
 */
export const registerUser = async (
  nombre_completo: string,
  username: string,
  password: string,
  fk_id_rol: number,
  email: string,
): Promise<ResultSetHeader> => {
  // Validar campos de entrada con Joi
  const { error } = registerSchema.validate({
    nombre_completo,
    username,
    password,
    fk_id_rol,
    email,
  });
  if (error) {
    throw new Error(error.details[0].message);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const estado_default = 1; // 1 = Activo por defecto
    const [result] = await pool.query<ResultSetHeader>(
      "CALL crear_usuario(?, ?, ?, ?, ?, ?)",
      [
        nombre_completo,
        username,
        hashedPassword,
        email,
        estado_default,
        fk_id_rol,
      ],
    );
    return result;
  } catch (error: unknown) {
    const err = error as { sqlState?: string; message?: string };
    if (err.sqlState === "45000") {
      throw new Error(err.message || "El usuario o email ya existe.");
    }
    throw error;
  }
};

/**
 * Autentica a un usuario validando sus credenciales y emitiendo un token JWT firmado.
 *
 * @param {string} username - Nombre de usuario.
 * @param {string} password - Contraseña en texto plano.
 * @returns {Promise<LoginResponse>} Objeto con el token JWT y los datos básicos del usuario.
 */
export const login = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  // Validar datos de entrada con Joi
  const { error } = loginSchema.validate({ username, password });
  if (error) {
    throw new Error(error.details[0].message);
  }

  // Consultar usuario mediante procedimiento almacenado
  const [rows] = await pool.query<RowDataPacket[][]>(
    "CALL OBTENER_USUARIO_POR_USERNAME(?)",
    [username],
  );

  const users = (rows[0] || []) as User[];
  const user = users[0];

  if (!user) {
    throw new Error("Usuario o contraseña inválidos");
  }

  // Verificar coincidencia de contraseña
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error("Usuario o contraseña inválidos");
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error(
      "Error crítico de configuración: JWT_SECRET no está definido.",
    );
  }

  // Generar token JWT con expiración de 1 hora
  const token = jwt.sign(
    { id_usuario: user.id_usuario, fk_id_rol: user.fk_id_rol },
    jwtSecret,
    { expiresIn: "1h" },
  );

  return {
    token,
    user: {
      id_usuario: user.id_usuario,
      username: user.username,
      fk_id_rol: user.fk_id_rol,
    },
  };
};
