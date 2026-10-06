import { Router } from 'express';
import * as espacioTrabajoController from '../controllers/espacioTrabajoController';

import authenticate from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

router.get('/getEspaciosTrabajo/:idproyecto', authenticate, authorizeRole([1, 2, 3]), espacioTrabajoController.OBTENER_ESPACIOS_TRABAJO);
router.post('/createEspacioTrabajo', authenticate, authorizeRole([1, 3]), espacioTrabajoController.CREAR_ESPACIO_TRABAJO);
router.put('/updateEspacioTrabajo/:id', authenticate, authorizeRole([1, 3]), espacioTrabajoController.ACTUALIZAR_ESPACIO_TRABAJO);
router.delete('/deleteEspacioTrabajo/:id', authenticate, authorizeRole([1, 3]), espacioTrabajoController.ELIMINAR_ESPACIO_TRABAJO);

export default router;
