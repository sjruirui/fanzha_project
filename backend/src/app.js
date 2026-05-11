const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { requestLogger } = require('./middleware/logger.middleware');

// Import routes
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { code: 429, message: '请求过于频繁，请稍后再试', data: null }
});
app.use('/api', limiter);

// Static files for uploads
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// API routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ code: 200, message: 'success', data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server (only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${config.env}`);
    console.log(`API Base URL: http://localhost:${PORT}/api`);
  });
}

module.exports = app;
