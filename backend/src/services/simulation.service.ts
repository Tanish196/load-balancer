import { routingService } from './routing.service.js';
import { loggingService } from './logging.service.js';
import { SimulationResult, RequestLog } from '../types/index.js';

class SimulationService {
  public simulateTraffic(count: number): SimulationResult {
    if (count <= 0 || count > 1000) {
      throw new Error('Simulation count must be between 1 and 1000');
    }

    const distribution: Record<string, number> = {};
    const localLogs: RequestLog[] = [];

    for (let i = 0; i < count; i++) {
      const response = routingService.routeRequest();

      if (!distribution[response.routedTo]) {
        distribution[response.routedTo] = 0;
      }
      distribution[response.routedTo]++;

      const allLogs = loggingService.getAllLogs();
      if (allLogs.length > 0) {
        localLogs.push(allLogs[allLogs.length - 1]);
      }
    }

    return {
      totalRequests: count,
      distribution,
      logs: localLogs,
    };
  }
}

export const simulationService = new SimulationService();
