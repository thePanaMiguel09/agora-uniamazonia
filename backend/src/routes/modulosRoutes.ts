import { Router } from 'express';
import * as modulosController from '../controllers/modulosController';

import authenticate from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

router.get('/getModulos/:idlaboratorio', authenticate, authorizeRole([1, 2, 3]), modulosController.getModulos);
router.post('/createModulo', authenticate, authorizeRole([1, 3]), modulosController.createModulo);
router.put('/updateModulo/:id', authenticate, authorizeRole([1, 3]), modulosController.updateModulo);
router.delete('/deleteModulo/:id', authenticate, authorizeRole([1, 3]), modulosController.deleteModulo);

export default router;
