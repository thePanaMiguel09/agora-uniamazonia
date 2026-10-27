import { Request, Response } from "express";
import axios from "axios";
import {
  prenderSwitch,
  apagarSwitch,
  obtenerSensores,
  obtenerSwitches,
  obtenerBombas,
} from "../services/homeAssistantService";

/**
 * @openapi
 * /api/home-assistant/switch/on:
 *   post:
 *     summary: Encender switch o luz en Home Assistant
 *     tags: [Home Assistant]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entityId
 *             properties:
 *               entityId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dispositivo encendido correctamente.
 */
export const encenderLuz = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { entityId } = req.body;

    if (!entityId) {
      return res
        .status(400)
        .json({ error: "El parámetro entityId es obligatorio." });
    }

    const result = await prenderSwitch(entityId);
    return res.status(200).json(result);
  } catch (error: unknown) {
    console.error(" Error al encender switch:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Error al encender el dispositivo";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/home-assistant/switch/off:
 *   post:
 *     summary: Apagar switch o luz en Home Assistant
 *     tags: [Home Assistant]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entityId
 *             properties:
 *               entityId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dispositivo apagado correctamente.
 */
export const apagarLuz = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { entityId } = req.body;

    if (!entityId) {
      return res
        .status(400)
        .json({ error: "El parámetro entityId es obligatorio." });
    }

    const result = await apagarSwitch(entityId);
    return res.status(200).json(result);
  } catch (error: unknown) {
    console.error(" Error al apagar switch:", error);
    const message =
      error instanceof Error ? error.message : "Error al apagar el dispositivo";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/home-assistant/sensores:
 *   get:
 *     summary: Obtener sensores desde Home Assistant
 *     tags: [Home Assistant]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sensores obtenida con éxito.
 */
export const getSensores = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const sensores = await obtenerSensores();
    return res.status(200).json(sensores);
  } catch (error: unknown) {
    console.error(" Error al obtener sensores:", error);
    const message =
      error instanceof Error ? error.message : "Error al obtener sensores";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/home-assistant/switches:
 *   get:
 *     summary: Obtener switches desde Home Assistant
 *     tags: [Home Assistant]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de switches obtenida con éxito.
 */
export const getSwitches = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const switches = await obtenerSwitches();
    return res.status(200).json(switches);
  } catch (error: unknown) {
    console.error(" Error al obtener switches:", error);
    const message =
      error instanceof Error ? error.message : "Error al obtener switches";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/home-assistant/bombas:
 *   get:
 *     summary: Obtener bombas desde Home Assistant
 *     tags: [Home Assistant]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de bombas obtenida con éxito.
 */
export const getBombas = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const bombas = await obtenerBombas();
    return res.status(200).json(bombas);
  } catch (error: unknown) {
    console.error(" Error al obtener bombas:", error);
    const message =
      error instanceof Error ? error.message : "Error al obtener bombas";
    return res.status(500).json({ error: message });
  }
};

/**
 * @openapi
 * /api/home-assistant/camera/{entityId}:
 *   get:
 *     summary: Proxy de stream de cámara de Home Assistant
 *     tags: [Home Assistant]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stream de video retransmitido con éxito.
 */
export const getCameraStream = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const rawEntityId = req.params.entityId;
  const entityId = Array.isArray(rawEntityId) ? rawEntityId[0] : rawEntityId;
  const HA_HOST = process.env.HA_HOST;
  const TOKEN = process.env.HA_TOKEN;

  if (!entityId) {
    res.status(400).json({ error: "El entityId de la cámara es obligatorio." });
    return;
  }

  if (!HA_HOST || !TOKEN) {
    res
      .status(500)
      .json({
        error: "Configuración de Home Assistant incompleta en el servidor.",
      });
    return;
  }

  try {
    const response = await axios({
      method: "get",
      url: `http://${HA_HOST}/api/camera_proxy/${entityId}`,
      responseType: "stream",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    const contentType = response.headers["content-type"];
    if (contentType) {
      res.set("Content-Type", String(contentType));
    }

    response.data.pipe(res);
  } catch (error: unknown) {
    console.error(
      ` [HA Camera Proxy Error] al solicitar ${entityId}:`,
      error instanceof Error ? error.message : error,
    );

    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to fetch camera stream" });
    }
  }
};
