import { Request, Response } from "express";
import { prenderSwitch, apagarSwitch, obtenerSensores, obtenerSwitches,obtenerBombas } from "../services/homeAssistantService";
import axios from "axios";

export const encenderLuz = async (req: Request, res: Response) => {
  const { entityId } = req.body;

  try {
    const result = await prenderSwitch(entityId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const apagarLuz = async (req: Request, res: Response) => {
  const { entityId } = req.body;

  try {
    const result = await apagarSwitch(entityId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSensores = async (req: Request, res: Response) => {
  try {
    const sensores = await obtenerSensores();
    res.json(sensores);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSwitches = async (req: Request, res: Response) => {
  try {
    const switches = await obtenerSwitches();
    res.json(switches);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBombas = async (req: Request, res: Response) => {
  try {
    const bombas = await obtenerBombas();
    res.json(bombas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


export const getCameraStream = async (req: Request, res: Response) => {
  const { entityId } = req.params;
  const HA_HOST = process.env.HA_HOST;
  const TOKEN = process.env.HA_TOKEN;

  try {
    const response = await axios({
      method: "get",
      url: `http://${HA_HOST}/api/camera_proxy/${entityId}`,
      responseType: "stream",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    if (response.headers['content-type']) {
      res.set('Content-Type', response.headers['content-type']);
    }
    
    response.data.pipe(res);
  } catch (error: any) {
    console.error(`[HA Camera Proxy Error] al solicitar ${entityId}:`, error.message);
    if (error.response) {
      console.error(`[HA Camera Proxy Error] Status: ${error.response.status}`);
    }
    res.status(500).json({ error: "Failed to fetch camera stream" });
  }
};