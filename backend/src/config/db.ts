import * as dotenv from 'dotenv';
import { createPool } from 'mysql2/promise';

dotenv.config();

export const pool = createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
});

// Probar conexión
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conectado a MySQL');
    connection.release();
  } catch (err) {
    console.error('Error de conexión a MySQL:', err);
  }
})();
