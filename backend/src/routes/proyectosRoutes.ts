import { Router } from 'express';
import * as proyectosController from '../controllers/proyectosController';

import authenticate from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

router.get('/getProyectos/:idproyecto', authenticate, authorizeRole([1, 2, 3]), proyectosController.getProyectos);
router.post('/createProyecto', authenticate, authorizeRole([1, 3]), proyectosController.createProyecto);
router.put('/updateProyecto/:id', authenticate, authorizeRole([1, 3]), proyectosController.updateProyecto);
router.delete('/deleteProyecto/:id', authenticate, authorizeRole([1, 3]), proyectosController.deleteProyecto);

export default router;
