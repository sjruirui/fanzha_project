// Simple console logger for development
const logger = {
  info: (msg, ...args) => console.log(`[INFO] ${new Date().toISOString()} -`, msg, ...args),
  error: (msg, ...args) => console.error(`[ERROR] ${new Date().toISOString()} -`, msg, ...args),
  warn: (msg, ...args) => console.warn(`[WARN] ${new Date().toISOString()} -`, msg, ...args),
  debug: (msg, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${new Date().toISOString()} -`, msg, ...args);
    }
  }
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress
    };

    if (res.statusCode >= 400) {
      logger.error(logData);
    } else {
      logger.info(logData);
    }
  });

  next();
};

module.exports = {
  logger,
  requestLogger
};