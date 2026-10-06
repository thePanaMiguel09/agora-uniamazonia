import { Router } from 'express';
import { getStats, getAlerts, getRecentActivity } from '../controllers/dashboardController';

const router = Router();

router.get('/dashboard/stats', getStats);
router.get('/dashboard/alerts', getAlerts);
router.get('/dashboard/activities', getRecentActivity);

export default router;
