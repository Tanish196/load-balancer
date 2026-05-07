import { nodeRegistry } from '../data/nodes.data.js';
import { consistentHashingBalancer } from '../algorithms/consistent-hashing.js';
import { loggingService } from './logging.service.js';
import { generateRandomIP } from '../utils/ip.util.js';
import { RouteResponseDTO } from '../dto/index.js';
import { ServerNode } from '../types/index.js';

class RoutingService {
  constructor() {
    // Initialize the hash ring with our initial data when the service starts
    consistentHashingBalancer.initialize(nodeRegistry.getAll());
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
    return nodeRegistry.getAll();
  }

  public addNode(id: string): ServerNode {
    if (nodeRegistry.getById(id)) {
      const error = new Error('Node already exists.');
      error.name = 'ConflictError';
      throw error;
    }

    const newNode: ServerNode = {
      id,
      status: 'healthy',
      weight: 1, 
    };

    nodeRegistry.add(newNode);
    consistentHashingBalancer.addNode(newNode);

    return newNode;
  }

  public removeNode(id: string): void {
    if (!nodeRegistry.getById(id)) {
      const error = new Error('Node not found.');
      error.name = 'NotFoundError';
      throw error;
    }

    if (nodeRegistry.getAll().length <= 1) {
      const error = new Error('Cannot remove the last active node. Routing would become impossible.');
      error.name = 'ValidationError';
      throw error;
    }
    nodeRegistry.remove(id);

    consistentHashingBalancer.removeNode(id);
  }

  public setNodeStatus(id: string, status: 'healthy' | 'unhealthy'): ServerNode {
    const node = nodeRegistry.getById(id);
    if (!node) {
      const error = new Error('Node not found.');
      error.name = 'NotFoundError';
      throw error;
    }

    if (node.status !== status) {
      nodeRegistry.updateStatus(id, status);

      if (status === 'unhealthy') {
        consistentHashingBalancer.removeNode(id);
      } else if (status === 'healthy') {
        consistentHashingBalancer.addNode(node);
      }
    }

    return node;
  }
}

export const routingService = new RoutingService();
