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

  public simulateFailover(): any {
    // 1. Initial State: Distribute 1000 requests
    const initialDistribution: Record<string, number> = {};
    for (let i = 0; i < 1000; i++) {
      const result = routingService.routeRequest();
      initialDistribution[result.routedTo] = (initialDistribution[result.routedTo] || 0) + 1;
    }

    // 2. Failover: Mark Node-B as unhealthy (if it exists)
    const nodeBExists = routingService.getNodes().find((n) => n.id === 'Node-B');
    let failoverDistribution: Record<string, number> = {};
    
    if (nodeBExists) {
      routingService.setNodeStatus('Node-B', 'unhealthy');

      // Distribute 1000 requests again
      for (let i = 0; i < 1000; i++) {
        const result = routingService.routeRequest();
        failoverDistribution[result.routedTo] = (failoverDistribution[result.routedTo] || 0) + 1;
      }

      // 3. Recovery: Mark Node-B as healthy again
      routingService.setNodeStatus('Node-B', 'healthy');
    }

    // 4. Recovery Distribution: Distribute 1000 requests again
    const recoveryDistribution: Record<string, number> = {};
    for (let i = 0; i < 1000; i++) {
      const result = routingService.routeRequest();
      recoveryDistribution[result.routedTo] = (recoveryDistribution[result.routedTo] || 0) + 1;
    }

    return {
      totalSimulatedRequestsPerPhase: 1000,
      phase1_HealthyCluster: initialDistribution,
      phase2_NodeBFails: failoverDistribution,
      phase3_NodeBRecovers: recoveryDistribution,
      explanation: 'Notice that during Phase 2, Node-B receives 0 traffic and its load is gracefully redistributed. In Phase 3, Node-B comes back online and instantly resumes handling its traffic share.',
    };
  }

  public simulateWeightedRouting(): any {
    // Note: We assume Node-A and Node-B exist.
    routingService.setNodeWeight('Node-A', 1);
    routingService.setNodeWeight('Node-B', 1);

    const initialDistribution: Record<string, number> = {};
    for (let i = 0; i < 5000; i++) {
      const result = routingService.routeRequest();
      initialDistribution[result.routedTo] = (initialDistribution[result.routedTo] || 0) + 1;
    }

    routingService.setNodeWeight('Node-B', 3);

    const weightedDistribution: Record<string, number> = {};
    for (let i = 0; i < 5000; i++) {
      const result = routingService.routeRequest();
      weightedDistribution[result.routedTo] = (weightedDistribution[result.routedTo] || 0) + 1;
    }

    routingService.setNodeWeight('Node-B', 1);

    return {
      totalSimulatedRequestsPerPhase: 5000,
      phase1_EqualWeights: initialDistribution,
      phase2_NodeB_Weight3: weightedDistribution,
      explanation: 'Notice that in Phase 1, traffic is roughly equal. In Phase 2, Node-B absorbs roughly 3x more traffic than Node-A because it has 3x more virtual nodes on the ring. Note: Consistent hashing provides probabilistic distribution, not exact percentages. Also note that weight guarantees ownership probability on the ring, not CPU/Memory fairness.',
    };
  }
}

export const simulationService = new SimulationService();
