import { Router } from "express";
import { encenderLuz, apagarLuz, getSensores, getSwitches, getCameraStream, getBombas } from "../controllers/homeAssistantController";

import authenticate from '../middlewares/authenticate';

const router = Router();

router.post("/luz/on", encenderLuz);
router.post("/luz/off", apagarLuz);
router.get("/sensores", getSensores);
router.get("/switches", getSwitches);
router.get("/camera/:entityId", getCameraStream);
router.get("/bombas", getBombas);

export default router;
