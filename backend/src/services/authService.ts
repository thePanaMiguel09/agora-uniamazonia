import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

const registerSchema = Joi.object({
  nombre_completo: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  fk_id_rol: Joi.number().required(),
  email: Joi.string().required(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

interface User extends RowDataPacket {
  id_usuario: number;
  nombre_completo: string;
  username: string;
  password: string;
  fk_id_rol: number;
  email: string;
}

export const registerUser = async (nombre_completo: string, username: string, password: string, fk_id_rol: number, email: string) => {
  // Validar todos los campos antes de seguir
  const { error } = registerSchema.validate({ nombre_completo, username, password, fk_id_rol, email });
  if (error) throw new Error(error.details[0].message);

  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    // El procedimiento crear_usuario ahora recibe el estado (1 por defecto)
    const estado_default = 1;
    const [result] = await pool.query(
      'CALL crear_usuario(?, ?, ?, ?, ?, ?)',
      [nombre_completo, username, hashedPassword, email, estado_default, fk_id_rol]
    );
    return result;
  } catch (error: any) {
    if (error.sqlState === '45000') {
      throw new Error(error.message); // El mensaje que lanza el SP "El usuario o email ya existe"
    }
    throw error;
  }
}

export const login = async (username: string, password: string) => {
  // Validar datos de entrada
  const { error } = loginSchema.validate({ username, password });
  if (error) throw new Error(error.details[0].message);

  // Consultar usuario con procedimiento almacenado
  const [rows] = await pool.query<RowDataPacket[]>(
    'CALL OBTENER_USUARIO_POR_USERNAME(?)',
    [username]
  );
  
  // En SPs, rows[0] contiene los resultados del SELECT
  const users = rows[0] as User[];
  const user = users[0];
  
  if (!user) throw new Error('Usuario o contraseña inválidos');

  // Verificar contraseña
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error('Usuario o contraseña inválidos');

  // Generar token JWT
  const token = jwt.sign(
    { id_usuario: user.id_usuario, fk_id_rol: user.fk_id_rol },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
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