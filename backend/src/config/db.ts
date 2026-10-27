import * as dotenv from "dotenv";
import { createPool, Pool } from "mysql2/promise";

dotenv.config();

/**
 * Pool de conexiones global para la base de datos MySQL.
 * Configurado con mysql2/promise para soportar operaciones asíncronas con async/await.
 */
export const pool: Pool = createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

/**
 * Prueba la conectividad inicial con la base de datos MySQL.
 *
 * @returns {Promise<void>}
 */
export const testDatabaseConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    console.log(
      "✅ Conexión establecida correctamente con la base de datos MySQL.",
    );
    connection.release();
  } catch (err) {
    console.error(
      " Error crítico al conectar con la base de datos MySQL:",
      err,
    );
  }
};

// Ejecutar verificación de conexión al iniciar el módulo
testDatabaseConnection();
