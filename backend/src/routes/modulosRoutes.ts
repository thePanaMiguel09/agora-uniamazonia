import { Router } from "express";
import * as modulosController from "../controllers/modulosController";
import authenticate from "../middlewares/authenticate";
import { authorizeRole } from "../middlewares/authorizeRole";

const router = Router();

/**
 * @route   GET /api/laboratorios/:idlaboratorio/modulos
 * @desc    Listar los módulos asociados a un laboratorio específico
 * @access  Privado (Roles: 1, 2, 3)
 */
router.get(
  "/laboratorios/:idlaboratorio/modulos",
  authenticate,
  authorizeRole([1, 2, 3]),
  modulosController.getModulos,
);

/**
 * @route   POST /api/modulos
 * @desc    Crear un nuevo módulo
 * @access  Privado (Roles: 1, 3)
 */
router.post(
  "/modulos",
  authenticate,
  authorizeRole([1, 3]),
  modulosController.createModulo,
);

/**
 * @route   PUT /api/modulos/:id
 * @desc    Actualizar la información de un módulo existente
 * @access  Privado (Roles: 1, 3)
 */
router.put(
  "/modulos/:id",
  authenticate,
  authorizeRole([1, 3]),
  modulosController.updateModulo,
);

/**
 * @route   DELETE /api/modulos/:id
 * @desc    Eliminar un módulo por su ID
 * @access  Privado (Roles: 1, 3)
 */
router.delete(
  "/modulos/:id",
  authenticate,
  authorizeRole([1, 3]),
  modulosController.deleteModulo,
);

export default router;
