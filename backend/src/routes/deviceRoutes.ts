import { Router } from "express";
import {
  getLaboratoryDevices,
  createLaboratoryDevice,
  deleteLaboratoryDevice,
  getEspacioTrabajoDevices,
  createEspacioTrabajoDevice,
  deleteEspacioTrabajoDevice,
  getBombasByModulo,
  getEstantesByModulo,
} from "../controllers/deviceController";

const router = Router();

// ==========================================
// Rutas de Dispositivos de Laboratorio (Cámaras y Aires Acondicionados)
// ==========================================

/**
 * @route   GET /api/laboratorios/:id/devices
 * @desc    Obtener dispositivos de un laboratorio específico
 * @access  Privado
 */
router.get("/laboratorios/:id/devices", getLaboratoryDevices);

/**
 * @route   POST /api/laboratorios/devices
 * @desc    Crear un nuevo dispositivo de laboratorio
 * @access  Privado
 */
router.post("/laboratorios/devices", createLaboratoryDevice);

/**
 * @route   DELETE /api/laboratorios/devices/:type/:id
 * @desc    Eliminar un dispositivo de laboratorio
 * @access  Privado
 */
router.delete("/laboratorios/devices/:type/:id", deleteLaboratoryDevice);

// ==========================================
// Rutas de Dispositivos de Espacios de Trabajo (Actuadores y Sensores)
// ==========================================

/**
 * @route   GET /api/espacios-trabajo/:id/devices
 * @desc    Obtener dispositivos de un espacio de trabajo
 * @access  Privado
 */
router.get("/espacios-trabajo/:id/devices", getEspacioTrabajoDevices);

/**
 * @route   POST /api/espacios-trabajo/devices
 * @desc    Crear un nuevo actuador o sensor en un espacio de trabajo
 * @access  Privado
 */
router.post("/espacios-trabajo/devices", createEspacioTrabajoDevice);

/**
 * @route   DELETE /api/espacios-trabajo/devices/:type/:id
 * @desc    Eliminar un dispositivo de espacio de trabajo
 * @access  Privado
 */
router.delete(
  "/espacios-trabajo/devices/:type/:id",
  deleteEspacioTrabajoDevice,
);

// ==========================================
// Rutas de Módulos (Bombas y Estantes)
// ==========================================

/**
 * @route   GET /api/modulos/:id/bombas
 * @desc    Obtener bombas asociadas a un módulo
 * @access  Privado
 */
router.get("/modulos/:id/bombas", getBombasByModulo);

/**
 * @route   GET /api/modulos/:id/estantes
 * @desc    Obtener estantes de un módulo para selectores
 * @access  Privado
 */
router.get("/modulos/:id/estantes", getEstantesByModulo);

export default router;
