import { Request, Response, NextFunction } from 'express';

export const validateNodeCreation = (req: Request, res: Response, next: NextFunction): void => {
  const { id, weight } = req.body;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    res.status(400).json({
      success: false,
      message: 'Validation Error: Node "id" is required and must be a non-empty string.',
    });
    return;
  }

  if (weight !== undefined) {
    if (typeof weight !== 'number' || weight < 1 || weight > 10 || !Number.isInteger(weight)) {
      res.status(400).json({
        success: false,
        message: 'Validation Error: "weight" must be an integer between 1 and 10.',
      });
      return;
    }
  }

  // Sanitize
  req.body.id = id.trim();
  
  next();
};

export const validateNodeWeight = (req: Request, res: Response, next: NextFunction): void => {
  const { weight } = req.body;

  if (weight === undefined || typeof weight !== 'number' || weight < 1 || weight > 10 || !Number.isInteger(weight)) {
    res.status(400).json({
      success: false,
      message: 'Validation Error: "weight" is required and must be an integer between 1 and 10.',
    });
    return;
  }

  next();
};
