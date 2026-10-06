import { Router } from 'express';
import * as rolController from '../controllers/rolController';

const router = Router();

router.get('/roles', rolController.getRoles); // Obtener todos los roles

export default router;
