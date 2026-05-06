import { Request, Response, NextFunction } from 'express';

export const validateNodeCreation = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.body;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    res.status(400).json({
      success: false,
      message: 'Validation Error: Node "id" is required and must be a non-empty string.',
    });
    return;
  }

  // Sanitize
  req.body.id = id.trim();
  
  next();
};
