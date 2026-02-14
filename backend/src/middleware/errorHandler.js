/**
 * Centralized error handling middleware
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Error handling middleware
 * Place as the last middleware in app.js
 */
export const errorHandler = (err, req, res, next) => {
  // Default error
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ID
  if (err.name === 'CastError') {
    error = new AppError(`Resource not found`, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error = new AppError('Duplicate field value entered', 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = new AppError(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Catch async errors wrapper
 * Wrap async route handlers to catch promise rejections
 */
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export { AppError };
