const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 3000,

  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'fanzha_project',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'fanzha_project_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  ai: {
    apiKey: process.env.AI_API_KEY,
    apiUrl: process.env.AI_API_URL
  },

  upload: {
    path: process.env.UPLOAD_PATH || 'src/uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
  }
};
