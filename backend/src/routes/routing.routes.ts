import { Router } from 'express';
import { routingController } from '../controllers/routing.controller.js';
import { validateNodeCreation } from '../middlewares/validation.middleware.js';

const router = Router();

router.get('/ring', routingController.getRing);

router.get('/nodes', routingController.getNodes);
router.post('/nodes', validateNodeCreation, routingController.addNode);
router.delete('/nodes/:id', routingController.removeNode);

router.get('/logs', routingController.getLogs);
router.post('/route', routingController.routeRequest);
router.post('/simulate', routingController.simulateTraffic);
router.post('/simulate-redistribution', routingController.proveRedistribution);

export default router;
