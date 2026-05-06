import { nodes } from '../data/nodes.data.js';
import { consistentHashingBalancer } from '../algorithms/consistent-hashing.js';
import { loggingService } from './logging.service.js';
import { generateRandomIP } from '../utils/ip.util.js';
import { RouteResponseDTO } from '../dto/index.js';
import { ServerNode } from '../types/index.js';

class RoutingService {
  constructor() {
    // Initialize the hash ring with our initial data when the service starts
    consistentHashingBalancer.initialize(nodes);
  }

  public routeRequest(clientIp?: string): RouteResponseDTO {
    const ip = clientIp || generateRandomIP();


    const selectedVirtualNode = consistentHashingBalancer.getNodeForIP(ip);

    const logEntry = loggingService.logRequest(
      ip, 
      selectedVirtualNode.physicalNodeId, 
      selectedVirtualNode.hash, 
      selectedVirtualNode.virtualNodeId
    );

    return {
      success: true,
      clientIp: ip,
      routedTo: selectedVirtualNode.physicalNodeId,
      timestamp: logEntry.timestamp,
    };
  }

  public getNodes(): ServerNode[] {
    return nodes;
  }
}

export const routingService = new RoutingService();
