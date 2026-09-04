import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isProduction = process.env.NODE_ENV === 'production';

  console.error('❌ Server Error:', err.message || err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const userMessage = isProduction
    ? 'An unexpected error occurred while processing your architectural request.'
    : err.message || 'An unexpected internal server error occurred.';

  res.status(statusCode).json({
    success: false,
    error: userMessage,
    stack: isProduction ? undefined : err.stack,
  });
};
