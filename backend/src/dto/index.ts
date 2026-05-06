export interface RouteRequestDTO {
  ip?: string; 
}

export interface SimulateRequestDTO {
  count: number;
}

export interface RouteResponseDTO {
  success: boolean;
  clientIp: string;
  routedTo: string;
  timestamp: string;
}

export interface AddNodeRequestDTO {
  id: string;
}

