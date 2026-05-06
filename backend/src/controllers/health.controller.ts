import { Request, Response } from 'express';

export const getHealth = (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Load Balancer Simulator API is healthy',
    timestamp: new Date().toISOString(),
  });
};
