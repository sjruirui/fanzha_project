const mysql = require('mysql2/promise');
const config = require('../config');

const pool = mysql.createPool(config.database);

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('Database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  console.log('Database pool closed');
  process.exit(0);
});

module.exports = pool;
