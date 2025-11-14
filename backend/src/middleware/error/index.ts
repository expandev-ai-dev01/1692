/**
 * @summary
 * Global error handling middleware.
 * Catches and formats all application errors.
 *
 * @module middleware/error
 */
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorMiddleware = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const code = error.code || 'INTERNAL_ERROR';

  console.error('Error:', {
    statusCode,
    code,
    message,
    path: req.path,
    method: req.method,
    stack: error.stack,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: error.details || undefined,
    },
    timestamp: new Date().toISOString(),
  });
};
