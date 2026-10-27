import { Router } from "express";
import {
  getStats,
  getAlerts,
  getRecentActivity,
} from "../controllers/dashboardController";

const router = Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Obtener estadísticas generales del dashboard
 * @access  Privado (Requiere autenticación)
 */
router.get("/dashboard/stats", getStats);

/**
 * @route   GET /api/dashboard/alerts
 * @desc    Obtener todas las alertas del sistema
 * @access  Privado (Requiere autenticación)
 */
router.get("/dashboard/alerts", getAlerts);

/**
 * @route   GET /api/dashboard/recent-activity
 * @desc    Obtener la actividad reciente del sistema
 * @access  Privado (Requiere autenticación)
 */
router.get("/dashboard/recent-activity", getRecentActivity);

export default router;
