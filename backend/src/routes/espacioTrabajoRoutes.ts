import { Router } from "express";
import * as espacioTrabajoController from "../controllers/espacioTrabajoController";
import authenticate from "../middlewares/authenticate";
import { authorizeRole } from "../middlewares/authorizeRole";

const router = Router();

/**
 * @route   GET /api/proyectos/:idproyecto/espacios-trabajo
 * @desc    Obtener los espacios de trabajo asociados a un proyecto
 * @access  Privado (Roles: 1, 2, 3)
 */
router.get(
  "/proyectos/:idproyecto/espacios-trabajo",
  authenticate,
  authorizeRole([1, 2, 3]),
  espacioTrabajoController.OBTENER_ESPACIOS_TRABAJO,
);

/**
 * @route   POST /api/espacios-trabajo
 * @desc    Crear un nuevo espacio de trabajo
 * @access  Privado (Roles: 1, 3)
 */
router.post(
  "/espacios-trabajo",
  authenticate,
  authorizeRole([1, 3]),
  espacioTrabajoController.CREAR_ESPACIO_TRABAJO,
);

/**
 * @route   PUT /api/espacios-trabajo/:id
 * @desc    Actualizar un espacio de trabajo existente
 * @access  Privado (Roles: 1, 3)
 */
router.put(
  "/espacios-trabajo/:id",
  authenticate,
  authorizeRole([1, 3]),
  espacioTrabajoController.ACTUALIZAR_ESPACIO_TRABAJO,
);

/**
 * @route   DELETE /api/espacios-trabajo/:id
 * @desc    Eliminar un espacio de trabajo por su ID
 * @access  Privado (Roles: 1, 3)
 */
router.delete(
  "/espacios-trabajo/:id",
  authenticate,
  authorizeRole([1, 3]),
  espacioTrabajoController.ELIMINAR_ESPACIO_TRABAJO,
);

export default router;
