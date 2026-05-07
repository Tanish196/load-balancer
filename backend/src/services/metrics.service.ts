import { loggingService } from './logging.service.js';
import { nodeRegistry } from '../data/nodes.data.js';
import { consistentHashingBalancer } from '../algorithms/consistent-hashing.js';
import { config } from '../config/index.js';

export interface NodeMetrics {
  weight: number;
  virtualNodes: number;
  requests: number;
}

export interface SystemMetrics {
  totalRequests: number;
  nodeDistribution: Record<string, NodeMetrics>;
  healthyNodes: number;
  unhealthyNodes: number;
  ringSize: number;
}

class MetricsService {

  public getMetrics(): SystemMetrics {
    const logs = loggingService.getAllLogs();
    const nodes = nodeRegistry.getAll();
    const ring = consistentHashingBalancer.getRingData();

    const nodeDistribution: Record<string, NodeMetrics> = {};
    let healthyCount = 0;
    let unhealthyCount = 0;

    for (const node of nodes) {
      if (node.status === 'healthy') {
        healthyCount++;
        nodeDistribution[node.id] = {
          weight: node.weight || 1,
          virtualNodes: (node.weight || 1) * config.virtualNodeCount,
          requests: 0,
        };
      } else {
        unhealthyCount++;
        nodeDistribution[node.id] = {
          weight: node.weight || 1,
          virtualNodes: 0, 
          requests: 0,
        };
      }
    }

    for (const log of logs) {
      if (nodeDistribution[log.routedTo]) {
        nodeDistribution[log.routedTo].requests++;
      }
    }

    return {
      totalRequests: logs.length,
      nodeDistribution,
      healthyNodes: healthyCount,
      unhealthyNodes: unhealthyCount,
      ringSize: ring.length,
    };
  }
}

export const metricsService = new MetricsService();
