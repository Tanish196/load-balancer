import { Request, Response, NextFunction } from 'express';

interface RateLimitData {
  count: number;
  resetTime: number;
}

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 5; // Allow 5 requests per minute for Demo purposes

const requestCounts = new Map<string, RateLimitData>();

export const rateLimitMetrics = {
  blockedRequests: 0,
  getActiveLimitedIPs: () => {
    let limitedCount = 0;
    const now = Date.now();
    for (const [_, data] of requestCounts.entries()) {
      if (data.count > MAX_REQUESTS && data.resetTime > now) {
        limitedCount++;
      }
    }
    return limitedCount;
  }
};

setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (data.resetTime < now) {
      requestCounts.delete(ip);
    }
  }
}, WINDOW_MS);

export const ipRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || 'unknown';
  const now = Date.now();

  let limitData = requestCounts.get(ip);

  if (!limitData || limitData.resetTime < now) {
    limitData = {
      count: 0,
      resetTime: now + WINDOW_MS,
    };
  }

  limitData.count++;
  requestCounts.set(ip, limitData);

  const remaining = Math.max(0, MAX_REQUESTS - limitData.count);
  const resetUnixSeconds = Math.ceil(limitData.resetTime / 1000);

  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', resetUnixSeconds);

  if (limitData.count > MAX_REQUESTS) {
    rateLimitMetrics.blockedRequests++;
    
    res.status(429).json({
      success: false,
      message: 'Too Many Requests. Please try again later.',
      retryAfter: resetUnixSeconds,
    });
    return;
  }

  next();
};
