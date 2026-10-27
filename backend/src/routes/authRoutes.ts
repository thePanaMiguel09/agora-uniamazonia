import { Router } from "express";
import * as authController from "../controllers/authController";

const router = Router();

/**
 * @route   POST /api/login
 * @desc    Autenticar un usuario y generar token JWT
 * @access  Público
 */
router.post("/login", authController.login);

/**
 * @route   POST /api/register
 * @desc    Registrar un nuevo usuario en el sistema
 * @access  Público
 */
router.post("/register", authController.registerUser);

export default router;
