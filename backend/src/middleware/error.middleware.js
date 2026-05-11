/**
 * Custom error classes
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = '未授权') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = '禁止访问') {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = '资源冲突') {
    super(message, 409);
  }
}

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
      data: err.errors || null
    });
  }

  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      code: 400,
      message: '数据已存在',
      data: null
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 401,
      message: 'Token无效',
      data: null
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 401,
      message: 'Token已过期',
      data: null
    });
  }

  // Default error
  res.status(500).json({
    code: 500,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
    data: null
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    code: 404,
    message: `路由 ${req.method} ${req.path} 不存在`,
    data: null
  });
};

/**
 * Async handler wrapper
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  errorHandler,
  notFoundHandler,
  asyncHandler
};