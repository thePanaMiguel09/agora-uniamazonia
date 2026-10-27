import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db";
import { setupSwagger } from "./config/swagger";
import { startHAWebsocketServer } from "./services/haWebSocketService";

// Importación de rutas de la API
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import laboratorioRoutes from "./routes/laboratorioRoutes";
import modulosRoutes from "./routes/modulosRoutes";
import proyectosRoutes from "./routes/proyectosRoutes";
import espacioTrabajoRoutes from "./routes/espacioTrabajoRoutes";
import homeAssistantRoutes from "./routes/homeAssistantRoutes";
import rolRoutes from "./routes/rolRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import deviceRoutes from "./routes/deviceRoutes";

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. Middlewares Globales
// ==========================================
app.use(cors());
app.use(express.json());

// ==========================================
// 2. Documentación API (Swagger)
// ==========================================
setupSwagger(app);

// ==========================================
// 3. Registro de Rutas de la API
// ==========================================
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", laboratorioRoutes);
app.use("/api", modulosRoutes);
app.use("/api", proyectosRoutes);
app.use("/api", espacioTrabajoRoutes);
app.use("/api", homeAssistantRoutes);
app.use("/api", rolRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", deviceRoutes);

// Ruta raíz de verificación
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "online",
    message: "Backend de LabControl Pro corriendo correctamente",
  });
});

// ==========================================
// 4. Inicialización del Servidor y Base de Datos
// ==========================================
const startServer = async (): Promise<void> => {
  try {
    // Verificar conexión a la base de datos MySQL
    const connection = await pool.getConnection();
    console.log("dConexión a MySQL establecida exitosamente.");
    connection.release();

    // Iniciar servidor HTTP
    const server = app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(
        `Documentación Swagger disponible en http://localhost:${PORT}/api-docs`,
      );
    });

    // Iniciar el puente WebSocket para Unity y Home Assistant
    startHAWebsocketServer(server);
  } catch (error) {
    console.error("Error crítico al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();
