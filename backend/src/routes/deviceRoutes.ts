import { Router } from 'express';
import { 
  getLaboratoryDevices, 
  createLaboratoryDevice, 
  deleteLaboratoryDevice,
  getEspacioTrabajoDevices,
  createEspacioTrabajoDevice,
  deleteEspacioTrabajoDevice,
  getBombasByModulo,
  getEstantesByModulo
} from '../controllers/deviceController';

const router = Router();

// Laboratory devices (Cámaras y Aires)
router.get('/devices/laboratorio/:id', getLaboratoryDevices);
router.post('/devices/laboratorio', createLaboratoryDevice);
router.delete('/devices/laboratorio/:type/:id', deleteLaboratoryDevice);

// Espacio Trabajo devices (Luces y Válvulas)
router.get('/devices/espacio/:id', getEspacioTrabajoDevices);
router.post('/devices/actuador', createEspacioTrabajoDevice);
router.delete('/devices/espacio/:type/:id', deleteEspacioTrabajoDevice);

// Projects/Modulo view (Bombas y lista de estantes)
router.get('/devices/modulo/:id/bombas', getBombasByModulo);
router.get('/devices/modulo/:id/estantes', getEstantesByModulo);

export default router;
