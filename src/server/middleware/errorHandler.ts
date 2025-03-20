
import { Request, Response, NextFunction } from 'express';

// Global error handler middleware
export const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error('Server error:', err);
  
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

// 404 Not found middleware
export const notFoundHandler = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
};
