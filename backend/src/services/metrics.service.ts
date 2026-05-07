import { loggingService } from './logging.service.js';
import { nodeRegistry } from '../data/nodes.data.js';
import { consistentHashingBalancer } from '../algorithms/consistent-hashing.js';

export interface SystemMetrics {
  totalRequests: number;
  perNodeRequests: Record<string, number>;
  healthyNodes: number;
  unhealthyNodes: number;
  ringSize: number;
}

class MetricsService {

  public getMetrics(): SystemMetrics {
    const logs = loggingService.getAllLogs();
    const nodes = nodeRegistry.getAll();
    const ring = consistentHashingBalancer.getRingData();

    // Calculate Request Distribution
    const perNodeRequests: Record<string, number> = {};
    for (const log of logs) {
      perNodeRequests[log.routedTo] = (perNodeRequests[log.routedTo] || 0) + 1;
    }

    // Calculate Node Health Status
    let healthyCount = 0;
    let unhealthyCount = 0;
    
    for (const node of nodes) {
      if (node.status === 'healthy') {
        healthyCount++;
      } else {
        unhealthyCount++;
      }
    }

    return {
      totalRequests: logs.length,
      perNodeRequests,
      healthyNodes: healthyCount,
      unhealthyNodes: unhealthyCount,
      ringSize: ring.length,
    };
  }
}

export const metricsService = new MetricsService();
