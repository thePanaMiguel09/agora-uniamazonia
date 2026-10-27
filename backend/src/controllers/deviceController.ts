import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/db";

/**
 * @openapi
 * /api/laboratorios/{id}/devices:
 *   get:
 *     summary: Obtener dispositivos de un laboratorio (cámaras y aires acondicionados)
 *     tags: [Devices]
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
 *         description: Lista de dispositivos obtenida con éxito.
 *       400:
 *         description: El ID del laboratorio es obligatorio.
 *       500:
 *         description: Error al recuperar dispositivos.
 */
export const getLaboratoryDevices = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ error: "El ID del laboratorio es obligatorio." });
    }

    const [camaras] = await pool.query<RowDataPacket[]>(
      `SELECT ID_CAMARA as id, NOMBRE_CAMARA as name, URL_STREAM as url, 
              ESTADO_CAMARA as status, 'camera' as type 
       FROM camara WHERE FK_ID_LABORATORIO = ?`,
      [id],
    );

    const [aires] = await pool.query<RowDataPacket[]>(
      `SELECT ID_CONTROLADOR_AIRE as id, NOMBRE_CONTROLADOR_AIRE as name, 
              TEMPERATURA_OBJETIVO_CONTROLADOR_AIRE as targetTemp, ESTADO_CONTROLADOR_AIRE as status, 
              'air-conditioner' as type 
       FROM controlador_aire WHERE FK_ID_LABORATORIO = ?`,
      [id],
    );

    return res.status(200).json([...camaras, ...aires]);
  } catch (error: unknown) {
    console.error(" Error getting laboratory devices:", error);
    const message =
      error instanceof Error ? error.message : "Error retrieving devices";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/laboratorios/devices:
 *   post:
 *     summary: Crear un nuevo dispositivo de laboratorio (cámara o aire acondicionado)
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - name
 *               - fk_id_laboratorio
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [camera, air-conditioner]
 *               name:
 *                 type: string
 *               fk_id_laboratorio:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Dispositivo creado correctamente.
 *       400:
 *         description: Datos incompletos o tipo de dispositivo inválido.
 */
export const createLaboratoryDevice = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { type: rawType, name, fk_id_laboratorio } = req.body;
    const type = typeof rawType === "string" ? rawType : undefined;

    if (!type || !name || !fk_id_laboratorio) {
      return res
        .status(400)
        .json({
          error: "Faltan campos obligatorios (type, name, fk_id_laboratorio).",
        });
    }

    if (type === "camera") {
      const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO camara (NOMBRE_CAMARA, URL_STREAM, FK_ID_LABORATORIO, ESTADO_CAMARA) VALUES (?, ?, ?, ?)",
        [name, "rtsp://mock.stream", fk_id_laboratorio, 1],
      );
      return res
        .status(201)
        .json({ id: result.insertId, type: "camera", name });
    }

    if (type === "air-conditioner") {
      const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO controlador_aire (NOMBRE_CONTROLADOR_AIRE, TEMPERATURA_OBJETIVO_CONTROLADOR_AIRE, ESTADO_CONTROLADOR_AIRE, FK_ID_LABORATORIO) VALUES (?, ?, ?, ?)",
        [name, 24.0, 0, fk_id_laboratorio],
      );
      return res
        .status(201)
        .json({ id: result.insertId, type: "air-conditioner", name });
    }

    return res
      .status(400)
      .json({ error: "Invalid device type for laboratory" });
  } catch (error: unknown) {
    console.error(" Error creating laboratory device:", error);
    const message =
      error instanceof Error ? error.message : "Error creating device";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/laboratorios/devices/{type}/{id}:
 *   delete:
 *     summary: Eliminar un dispositivo de laboratorio
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dispositivo eliminado correctamente.
 *       400:
 *         description: Tipo de dispositivo inválido.
 */
export const deleteLaboratoryDevice = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const rawType = req.params.type;
    const type = Array.isArray(rawType) ? rawType[0] : rawType;
    const { id } = req.params;

    if (type === "camera") {
      await pool.query("DELETE FROM camara WHERE ID_CAMARA = ?", [id]);
    } else if (type === "air-conditioner") {
      await pool.query(
        "DELETE FROM controlador_aire WHERE ID_CONTROLADOR_AIRE = ?",
        [id],
      );
    } else {
      return res
        .status(400)
        .json({ error: "Invalid device type for deletion" });
    }

    return res.status(200).json({ message: "Device deleted successfully" });
  } catch (error: unknown) {
    console.error(" Error deleting laboratory device:", error);
    const message =
      error instanceof Error ? error.message : "Error deleting device";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/espacios-trabajo/{id}/devices:
 *   get:
 *     summary: Obtener dispositivos de un espacio de trabajo (actuadores y sensores)
 *     tags: [Devices]
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
 *         description: Lista de dispositivos obtenida con éxito.
 */
export const getEspacioTrabajoDevices = async (
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

    const [actuadores] = await pool.query<RowDataPacket[]>(
      `SELECT ID_ACTUADOR as id, NOMBRE_ACTUADOR as name, 
       IF(FK_ID_TIPO_ACTUADOR = 1, 'valve', IF(FK_ID_TIPO_ACTUADOR = 3, 'light', 'fan')) as type,
       FK_ID_ESPACIO_TRABAJO as fk_id_espacio_trabajo
       FROM actuador 
       WHERE FK_ID_ESPACIO_TRABAJO = ?`,
      [id],
    );

    const [sensores] = await pool.query<RowDataPacket[]>(
      `SELECT ID_SENSOR as id, NOMBRE_SENSOR as name, 
       IF(FK_ID_TIPO_SENSOR = 1, 'temperature', IF(FK_ID_TIPO_SENSOR = 2, 'humidity', 'ph')) as type,
       FK_ID_ESPACIO_TRABAJO as fk_id_espacio_trabajo
       FROM sensor 
       WHERE FK_ID_ESPACIO_TRABAJO = ?`,
      [id],
    );

    return res.status(200).json([...actuadores, ...sensores]);
  } catch (error: unknown) {
    console.error(" Error getting espacio trabajo devices:", error);
    const message =
      error instanceof Error ? error.message : "Error retrieving devices";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/espacios-trabajo/devices:
 *   post:
 *     summary: Crear un nuevo actuador o sensor en un espacio de trabajo
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - name
 *               - fk_id_espacio_trabajo
 *             properties:
 *               type:
 *                 type: string
 *               name:
 *                 type: string
 *               fk_id_espacio_trabajo:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Dispositivo creado correctamente.
 */
export const createEspacioTrabajoDevice = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { type: rawType, name, fk_id_espacio_trabajo } = req.body;
    const type = typeof rawType === "string" ? rawType : undefined;

    if (!type || !name || !fk_id_espacio_trabajo) {
      return res
        .status(400)
        .json({
          error:
            "Faltan campos obligatorios (type, name, fk_id_espacio_trabajo).",
        });
    }

    if (["valve", "light", "fan"].includes(type)) {
      let tipoId = 0;
      if (type === "valve") tipoId = 1;
      else if (type === "light") tipoId = 3;
      else if (type === "fan") tipoId = 2;

      const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO actuador (NOMBRE_ACTUADOR, FK_ID_TIPO_ACTUADOR, FK_ID_ESTADO_DISPOSITIVO, FK_ID_ESPACIO_TRABAJO) VALUES (?, ?, ?, ?)",
        [name, tipoId, 1, fk_id_espacio_trabajo],
      );
      return res
        .status(201)
        .json({ id: result.insertId, type, name, fk_id_espacio_trabajo });
    }

    if (["temperature", "humidity", "ph"].includes(type)) {
      let tipoId = 0;
      if (type === "temperature") tipoId = 1;
      else if (type === "humidity") tipoId = 2;
      else if (type === "ph") tipoId = 3;

      const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO sensor (NOMBRE_SENSOR, FK_ID_TIPO_SENSOR, FK_ID_ESTADO_DISPOSITIVO, FK_ID_ESPACIO_TRABAJO) VALUES (?, ?, ?, ?)",
        [name, tipoId, 1, fk_id_espacio_trabajo],
      );
      return res
        .status(201)
        .json({ id: result.insertId, type, name, fk_id_espacio_trabajo });
    }

    return res
      .status(400)
      .json({ error: "Invalid device type for espacio trabajo" });
  } catch (error: unknown) {
    console.error(" Error creating espacio trabajo device:", error);
    const message =
      error instanceof Error ? error.message : "Error creating device";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/espacios-trabajo/devices/{type}/{id}:
 *   delete:
 *     summary: Eliminar un actuador o sensor de un espacio de trabajo
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dispositivo eliminado correctamente.
 */
export const deleteEspacioTrabajoDevice = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const rawType = req.params.type;
    const type = Array.isArray(rawType) ? rawType[0] : rawType;
    const { id } = req.params;

    if (!type) {
      return res
        .status(400)
        .json({ error: "El tipo de dispositivo es obligatorio." });
    }

    if (["valve", "light", "fan"].includes(type)) {
      await pool.query("DELETE FROM actuador WHERE ID_ACTUADOR = ?", [id]);
    } else if (["temperature", "humidity", "ph"].includes(type)) {
      await pool.query("DELETE FROM sensor WHERE ID_SENSOR = ?", [id]);
    } else {
      return res.status(400).json({ error: "Invalid device type" });
    }

    return res.status(200).json({ message: "Device deleted successfully" });
  } catch (error: unknown) {
    console.error(" Error deleting device:", error);
    const message =
      error instanceof Error ? error.message : "Error deleting device";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/modulos/{id}/bombas:
 *   get:
 *     summary: Obtener bombas asociadas a un módulo específico
 *     tags: [Devices]
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
 *         description: Lista de bombas obtenida con éxito.
 */
export const getBombasByModulo = async (
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

    const [bombas] = await pool.query<RowDataPacket[]>(
      `SELECT a.ID_ACTUADOR as id, a.NOMBRE_ACTUADOR as name, 'valve' as type, e.NOMBRE_ESPACIO_TRABAJO as shelfName
       FROM actuador a
       JOIN espacio_trabajo e ON a.FK_ID_ESPACIO_TRABAJO = e.ID_ESPACIO_TRABAJO
       JOIN proyecto p ON e.FK_ID_PROYECTO = p.ID_PROYECTO
       WHERE p.FK_ID_MODULO = ? AND a.FK_ID_TIPO_ACTUADOR = 1`,
      [id],
    );

    return res.status(200).json(bombas);
  } catch (error: unknown) {
    console.error(" Error getting bombas for modulo:", error);
    const message =
      error instanceof Error ? error.message : "Error retrieving bombas";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/modulos/{id}/estantes:
 *   get:
 *     summary: Obtener espacios de trabajo (estantes) de un módulo para dropdowns
 *     tags: [Devices]
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
 *         description: Lista de estantes obtenida con éxito.
 */
export const getEstantesByModulo = async (
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

    const [estantes] = await pool.query<RowDataPacket[]>(
      `SELECT e.ID_ESPACIO_TRABAJO as id, e.NOMBRE_ESPACIO_TRABAJO as name, p.NOMBRE_PROYECTO as projectName
       FROM espacio_trabajo e
       JOIN proyecto p ON e.FK_ID_PROYECTO = p.ID_PROYECTO
       WHERE p.FK_ID_MODULO = ?`,
      [id],
    );

    return res.status(200).json(estantes);
  } catch (error: unknown) {
    console.error(" Error getting estantes for modulo:", error);
    const message =
      error instanceof Error ? error.message : "Error retrieving estantes";
    return res.status(500).json({ error: message });
  }
};
