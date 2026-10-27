import { Router } from "express";
import * as userController from "../controllers/userController";
import authenticate from "../middlewares/authenticate";
import { authorizeRole } from "../middlewares/authorizeRole";

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios registrados en el sistema
 * @access  Privado (Rol: 1 - Administrador)
 */
router.get("/users", authenticate, authorizeRole([1]), userController.getUsers);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar la información de un usuario existente
 * @access  Privado (Rol: 1 - Administrador)
 */
router.put(
  "/users/:id",
  authenticate,
  authorizeRole([1]),
  userController.updateUser,
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar un usuario del sistema por su ID
 * @access  Privado (Rol: 1 - Administrador)
 */
router.delete(
  "/users/:id",
  authenticate,
  authorizeRole([1]),
  userController.deleteUser,
);

export default router;
