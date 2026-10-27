import { Router } from "express";
import {
  encenderLuz,
  apagarLuz,
  getSensores,
  getSwitches,
  getCameraStream,
  getBombas,
} from "../controllers/homeAssistantController";
import authenticate from "../middlewares/authenticate";

const router = Router();

/**
 * @route   POST /api/home-assistant/switch/on
 * @desc    Encender switch o luz en Home Assistant
 * @access  Privado (Requiere autenticación)
 */
router.post("/home-assistant/switch/on", authenticate, encenderLuz);

/**
 * @route   POST /api/home-assistant/switch/off
 * @desc    Apagar switch o luz en Home Assistant
 * @access  Privado (Requiere autenticación)
 */
router.post("/home-assistant/switch/off", authenticate, apagarLuz);

/**
 * @route   GET /api/home-assistant/sensores
 * @desc    Obtener lista de sensores desde Home Assistant
 * @access  Privado (Requiere autenticación)
 */
router.get("/home-assistant/sensores", authenticate, getSensores);

/**
 * @route   GET /api/home-assistant/switches
 * @desc    Obtener lista de switches desde Home Assistant
 * @access  Privado (Requiere autenticación)
 */
router.get("/home-assistant/switches", authenticate, getSwitches);

/**
 * @route   GET /api/home-assistant/camera/:entityId
 * @desc    Obtener stream de video de una cámara de Home Assistant
 * @access  Privado (Requiere autenticación)
 */
router.get("/home-assistant/camera/:entityId", authenticate, getCameraStream);

/**
 * @route   GET /api/home-assistant/bombas
 * @desc    Obtener lista de bombas desde Home Assistant
 * @access  Privado (Requiere autenticación)
 */
router.get("/home-assistant/bombas", authenticate, getBombas);

export default router;
