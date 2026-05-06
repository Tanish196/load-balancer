import { requestLogs } from '../data/logs.data.js';
import { RequestLog } from '../types/index.js';
import crypto from 'crypto';

class LoggingService {
  public logRequest(clientIp: string, routedTo: string): RequestLog {
    const logEntry: RequestLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      clientIp,
      routedTo,
    };

    requestLogs.push(logEntry);
    return logEntry;
  }

  public getAllLogs(): RequestLog[] {
    return requestLogs;
  }
}

export const loggingService = new LoggingService();
