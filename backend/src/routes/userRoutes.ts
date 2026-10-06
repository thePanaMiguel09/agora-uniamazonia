import { Router } from 'express';
import * as userController from '../controllers/userController';
import authenticate from '../middlewares/authenticate';
import { authorizeRole } from '../middlewares/authorizeRole';

const router = Router();

router.get('/users', authenticate, authorizeRole([1]), userController.getUsers); // Obtener todos los usuarios
router.delete('/users/:id', authenticate, authorizeRole([1]), userController.deleteUser); // Eliminar un usuario
router.put('/users/:id', authenticate, authorizeRole([1]), userController.updateUser); // Editar un usuario

export default router;