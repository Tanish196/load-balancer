import { routingService } from './routing.service.js';
import { loggingService } from './logging.service.js';
import { SimulationResult, RequestLog } from '../types/index.js';
import { generateRandomIP } from '../utils/ip.util.js';
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

  public proveMinimalRedistribution(): any {
    const ips: string[] = [];
    for (let i = 0; i < 1000; i++) {
      ips.push(generateRandomIP());
    }

    const beforeMapping: Record<string, string> = {};
    const beforeCounts: Record<string, number> = {};
    
    for (const ip of ips) {
      const result = routingService.routeRequest(ip);
      beforeMapping[ip] = result.routedTo;
      beforeCounts[result.routedTo] = (beforeCounts[result.routedTo] || 0) + 1;
    }

    const newNodeId = 'Node-D';
    routingService.addNode(newNodeId);

    const afterMapping: Record<string, string> = {};
    const afterCounts: Record<string, number> = {};
    let changedMappingsCount = 0;

    for (const ip of ips) {
      const result = routingService.routeRequest(ip);
      afterMapping[ip] = result.routedTo;
      afterCounts[result.routedTo] = (afterCounts[result.routedTo] || 0) + 1;

      if (beforeMapping[ip] !== afterMapping[ip]) {
        changedMappingsCount++;
      }
    }

    routingService.removeNode(newNodeId);

    return {
      totalSimulatedRequests: 1000,
      changedMappings: changedMappingsCount,
      percentageChanged: `${((changedMappingsCount / 1000) * 100).toFixed(2)}%`,
      explanation: 'Consistent hashing guarantees minimal redistribution',
      distributionBefore: beforeCounts,
      distributionAfterAddingNodeD: afterCounts,
    };
  }
}

export const simulationService = new SimulationService();
