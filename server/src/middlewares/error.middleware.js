// Basic error handler middleware for the application
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500,
  };

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = 'Invalid resource ID';
    error.status = 400;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.message = 'Duplicate resource';
    error.status = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(val => val.message).join(', ');
    error.status = 400;
  }

  // Prisma errors
  if (err.code === 'P2002') {
    error.message = 'Duplicate entry for unique field';
    error.status = 400;
  }

  if (err.code === 'P2025') {
    error.message = 'Record not found';
    error.status = 404;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.status = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.status = 401;
  }

  // Send error response
  res.status(error.status).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// 404 Not Found middleware
export const notFound = (req, res) => {
  // Guard: Socket.IO already handled this, or another handler sent a response.
  if (res.headersSent) return;
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
};

// Async error handler wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
