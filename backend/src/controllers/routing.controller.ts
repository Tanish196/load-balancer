import { Request, Response } from 'express';
import { routingService } from '../services/routing.service.js';
import { loggingService } from '../services/logging.service.js';
import { simulationService } from '../services/simulation.service.js';
import { metricsService } from '../services/metrics.service.js';
import { RouteRequestDTO, SimulateRequestDTO } from '../dto/index.js';
import { consistentHashingBalancer } from '../algorithms/consistent-hashing.js';

class RoutingController {
  public getMetrics(_req: Request, res: Response): void {
    try {
      const metrics = metricsService.getMetrics();
      res.status(200).json({ success: true, data: metrics });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  public getRing(_req: Request, res: Response): void {
    const ringData = consistentHashingBalancer.getRingData();
    res.status(200).json({ success: true, count: ringData.length, data: ringData });
  }

  public getNodes(_req: Request, res: Response): void {
    const nodes = routingService.getNodes();
    res.status(200).json({ success: true, count: nodes.length, data: nodes });
  }

  public addNode(req: Request, res: Response): void {
    try {
      const { id, weight } = req.body;
      const newNode = routingService.addNode(id, weight);
      res.status(201).json({ success: true, data: newNode });
    } catch (error: any) {
      if (error.name === 'ConflictError') {
        res.status(409).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    }
  }

  public updateNodeWeight(req: Request, res: Response): void {
    try {
      const id = req.params.id as string;
      const { weight } = req.body;
      const node = routingService.setNodeWeight(id, weight);
      res.status(200).json({ success: true, data: node });
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    }
  }

  public removeNode(req: Request, res: Response): void {
    try {
      const id = req.params.id as string;
      routingService.removeNode(id);
      res.status(200).json({ success: true, message: `Node ${id} successfully removed.` });
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        res.status(404).json({ success: false, message: error.message });
      } else if (error.name === 'ValidationError') {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    }
  }

  public markNodeHealthy(req: Request, res: Response): void {
    try {
      const id = req.params.id as string;
      const node = routingService.setNodeStatus(id, 'healthy');
      res.status(200).json({ success: true, data: node });
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    }
  }

  public markNodeUnhealthy(req: Request, res: Response): void {
    try {
      const id = req.params.id as string;
      const node = routingService.setNodeStatus(id, 'unhealthy');
      res.status(200).json({ success: true, data: node });
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    }
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
      const count = req.body.count || 10;
      const result = simulationService.simulateTraffic(count);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public proveRedistribution(_req: Request, res: Response): void {
    try {
      const result = simulationService.proveMinimalRedistribution();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public simulateFailover(_req: Request, res: Response): void {
    try {
      const result = simulationService.simulateFailover();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public simulateWeightedRouting(_req: Request, res: Response): void {
    try {
      const result = simulationService.simulateWeightedRouting();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const routingController = new RoutingController();
