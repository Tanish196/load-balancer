export type NodeStatus = 'healthy' | 'unhealthy' | 'draining';

export interface ServerNode {
  id: string;
  status: NodeStatus;
  weight: number; // Added for future weighted routing
}

export interface VirtualNode {
  hash: number;
  virtualNodeId: string;
  physicalNodeId: string;
}

export interface RequestLog {
  id: string;
  timestamp: string;
  clientIp: string;
  hash?: number;          // The raw hash value of the IP
  virtualNode?: string;   // The specific virtual node replica hit
  routedTo: string;       // The underlying physical node
}

export interface SimulationResult {
  totalRequests: number;
  logs: RequestLog[];
  distribution: Record<string, number>;
}
