import { Router } from "express";
import * as proyectosController from "../controllers/proyectosController";
import authenticate from "../middlewares/authenticate";
import { authorizeRole } from "../middlewares/authorizeRole";

const router = Router();

/**
 * @route   GET /api/modulos/:idproyecto/proyectos
 * @desc    Listar los proyectos asociados a un módulo específico
 * @access  Privado (Roles: 1, 2, 3)
 */
router.get(
  "/modulos/:idproyecto/proyectos",
  authenticate,
  authorizeRole([1, 2, 3]),
  proyectosController.getProyectos,
);

/**
 * @route   POST /api/proyectos
 * @desc    Crear un nuevo proyecto
 * @access  Privado (Roles: 1, 3)
 */
router.post(
  "/proyectos",
  authenticate,
  authorizeRole([1, 3]),
  proyectosController.createProyecto,
);

/**
 * @route   PUT /api/proyectos/:id
 * @desc    Actualizar un proyecto existente
 * @access  Privado (Roles: 1, 3)
 */
router.put(
  "/proyectos/:id",
  authenticate,
  authorizeRole([1, 3]),
  proyectosController.updateProyecto,
);

/**
 * @route   DELETE /api/proyectos/:id
 * @desc    Eliminar un proyecto por su ID
 * @access  Privado (Roles: 1, 3)
 */
router.delete(
  "/proyectos/:id",
  authenticate,
  authorizeRole([1, 3]),
  proyectosController.deleteProyecto,
);

export default router;
