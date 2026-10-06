import { Router } from 'express';
import * as laboratorioController from '../controllers/laboratorioController';
import authenticate from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

// ✅ Rutas REST
router.get('/getLaboratorios', authenticate, authorizeRole([1, 3]), laboratorioController.getLaboratorios);
router.post('/createLaboratorio', authenticate, authorizeRole([1]), laboratorioController.createLaboratorio);
router.put('/updateLaboratorio/:id', authenticate, authorizeRole([1, 3]), laboratorioController.updateLaboratorio);
router.delete('/deleteLaboratorio/:id', authenticate, authorizeRole([1]), laboratorioController.deleteLaboratorio);

export default router;
