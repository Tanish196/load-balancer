import { Request, Response } from 'express';
import { routingService } from '../services/routing.service.js';
import { loggingService } from '../services/logging.service.js';
import { simulationService } from '../services/simulation.service.js';
import { RouteRequestDTO, SimulateRequestDTO } from '../dto/index.js';

class RoutingController {
  public getNodes(_req: Request, res: Response): void {
    const nodes = routingService.getNodes();
    res.status(200).json({ success: true, data: nodes });
  }

  public getLogs(_req: Request, res: Response): void {
    const logs = loggingService.getAllLogs();
    res.status(200).json({ success: true, data: logs });
  }

  public routeRequest(req: Request<{}, {}, RouteRequestDTO>, res: Response): void {
    try {
      const { ip } = req.body;
      const result = routingService.routeRequest(ip);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(503).json({ success: false, message: error.message });
    }
  }

  public simulateTraffic(req: Request<{}, {}, SimulateRequestDTO>, res: Response): void {
    try {
      const count = req.body.count || 10; // Default to 10 if not provided
      const result = simulationService.simulateTraffic(count);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const routingController = new RoutingController();
