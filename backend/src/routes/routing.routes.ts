import { Router } from 'express';
import { routingController } from '../controllers/routing.controller.js';

const router = Router();

router.get('/ring', routingController.getRing);
router.get('/nodes', routingController.getNodes);
router.get('/logs', routingController.getLogs);
router.post('/route', routingController.routeRequest);
router.post('/simulate', routingController.simulateTraffic);

export default router;
