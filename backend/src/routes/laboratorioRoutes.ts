import { Router } from "express";
import * as laboratorioController from "../controllers/laboratorioController";
import authenticate from "../middlewares/authenticate";
import { authorizeRole } from "../middlewares/authorizeRole";

const router = Router();

/**
 * @route   GET /api/laboratorios
 * @desc    Listar todos los laboratorios según los permisos del usuario autenticado
 * @access  Privado (Roles: 1, 3)
 */
router.get(
  "/laboratorios",
  authenticate,
  authorizeRole([1, 3]),
  laboratorioController.getLaboratorios,
);

/**
 * @route   POST /api/laboratorios
 * @desc    Crear un nuevo laboratorio en el sistema
 * @access  Privado (Rol: 1 - Administrador)
 */
router.post(
  "/laboratorios",
  authenticate,
  authorizeRole([1]),
  laboratorioController.createLaboratorio,
);

/**
 * @route   PUT /api/laboratorios/:id
 * @desc    Actualizar la información de un laboratorio existente
 * @access  Privado (Roles: 1, 3)
 */
router.put(
  "/laboratorios/:id",
  authenticate,
  authorizeRole([1, 3]),
  laboratorioController.updateLaboratorio,
);

/**
 * @route   DELETE /api/laboratorios/:id
 * @desc    Eliminar un laboratorio por su ID
 * @access  Privado (Rol: 1 - Administrador)
 */
router.delete(
  "/laboratorios/:id",
  authenticate,
  authorizeRole([1]),
  laboratorioController.deleteLaboratorio,
);

export default router;
