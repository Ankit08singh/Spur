import { Request, Response, NextFunction } from 'express';
import { ValidationException } from '../validators/message.validator';
import { ERROR_MESSAGES } from '../utils/constants';

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    details?: any;
  };
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  if (err instanceof ValidationException) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: err.errors,
      },
    } as ErrorResponse);
    return;
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.DATABASE_ERROR,
      },
    } as ErrorResponse);
    return;
  }

  if (err.message === ERROR_MESSAGES.INVALID_SESSION) {
    res.status(404).json({
      success: false,
      error: {
        message: err.message,
      },
    } as ErrorResponse);
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      message: ERROR_MESSAGES.INTERNAL_ERROR,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
  } as ErrorResponse);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
    },
  } as ErrorResponse);
};
