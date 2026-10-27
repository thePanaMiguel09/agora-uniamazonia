import { Router } from "express";
import * as rolController from "../controllers/rolController";
import authenticate from "../middlewares/authenticate";
import { authorizeRole } from "../middlewares/authorizeRole";

const router = Router();

/**
 * @route   GET /api/roles
 * @desc    Obtener todos los roles disponibles en el sistema
 * @access  Privado (Roles: 1, 3)
 */
router.get(
  "/roles",
  authenticate,
  authorizeRole([1, 3]),
  rolController.getRoles,
);

export default router;
