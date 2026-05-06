export type NodeStatus = 'healthy' | 'unhealthy' | 'draining';

export interface ServerNode {
  id: string;
  status: NodeStatus;
}

export interface RequestLog {
  id: string;
  timestamp: string;
  clientIp: string;
  routedTo: string;
}

export interface SimulationResult {
  totalRequests: number;
  logs: RequestLog[];
  distribution: Record<string, number>;
}
