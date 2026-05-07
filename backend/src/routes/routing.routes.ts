import { Router } from 'express';
import { routingController } from '../controllers/routing.controller.js';
import { validateNodeCreation, validateNodeWeight } from '../middlewares/validation.middleware.js';

const router = Router();

router.get('/ring', routingController.getRing);

router.get('/nodes', routingController.getNodes);
router.post('/nodes', validateNodeCreation, routingController.addNode);
router.delete('/nodes/:id', routingController.removeNode);
router.patch('/nodes/:id/healthy', routingController.markNodeHealthy);
router.patch('/nodes/:id/unhealthy', routingController.markNodeUnhealthy);
router.patch('/nodes/:id/weight', validateNodeWeight, routingController.updateNodeWeight);

router.get('/metrics', routingController.getMetrics);
router.get('/logs', routingController.getLogs);
router.post('/route', routingController.routeRequest);
router.post('/simulate', routingController.simulateTraffic);
router.post('/simulate-redistribution', routingController.proveRedistribution);
router.post('/simulate-failover', routingController.simulateFailover);
router.post('/simulate-weighted-routing', routingController.simulateWeightedRouting);

export default router;
