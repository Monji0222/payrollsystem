require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/config/database');

// Export app for Vercel (serverless)
module.exports = app;

// Only run server locally (not on Vercel)
if (require.main === module) {
  const PORT = process.env.APP_PORT || process.env.PORT || 5000;

  // Test database connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection error:', err);
      process.exit(1);
    }
    console.log('✅ Database connected successfully');
    console.log('Database time:', res.rows[0].now);
  });

  // Start server
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      pool.end(() => {
        console.log('Database pool closed');
        process.exit(0);
      });
    });
  });
}