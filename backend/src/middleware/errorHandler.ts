import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation Error',
      details: err.details
    });
    return;
  }

  if (err.code === '23505') {
    res.status(409).json({
      error: 'Resource already exists'
    });
    return;
  }

  if (err.code === '23503') {
    res.status(400).json({
      error: 'Referenced resource does not exist'
    });
    return;
  }

  if (err.status) {
    res.status(err.status).json({
      error: err.message
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error'
  });
};

export default errorHandler;