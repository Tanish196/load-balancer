import { nodes } from '../data/nodes.data.js';
import { roundRobinBalancer } from '../algorithms/round-robin.js';
import { loggingService } from './logging.service.js';
import { generateRandomIP } from '../utils/ip.util.js';
import { RouteResponseDTO } from '../dto/index.js';
import { ServerNode } from '../types/index.js';


class RoutingService {
  public routeRequest(clientIp?: string): RouteResponseDTO {
    const ip = clientIp || generateRandomIP();

    const healthyNodes: ServerNode[] = nodes.filter((node) => node.status === 'healthy');

    if (healthyNodes.length === 0) {
      throw new Error('503: Service Unavailable. No healthy nodes.');
    }

    const selectedNode = roundRobinBalancer.getNextNode(healthyNodes);

    const logEntry = loggingService.logRequest(ip, selectedNode.id);

    return {
      success: true,
      clientIp: ip,
      routedTo: selectedNode.id,
      timestamp: logEntry.timestamp,
    };
  }

  public getNodes(): ServerNode[] {
    return nodes;
  }
}

export const routingService = new RoutingService();
