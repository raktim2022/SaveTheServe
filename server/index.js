
import http from 'http';
import app from './src/app.js';
import { config } from './src/config/env.config.js';
import { connectDatabase } from './src/models/index.js';
import { initializeSocket } from './src/sockets/index.js';
import logger from './src/utils/logger.js';
import { startExpiryJob } from './src/jobs/expireFood.job.js';
import { startNotificationJob } from './src/jobs/notification.job.js';
import { startDailyReportsJob } from './src/jobs/dailyReports.job.js';
import { startCleanupJob } from './src/jobs/cleanup.job.js';

const PORT = config.PORT || 3000;

// Create HTTP server (IMPORTANT: Don't use app.listen())
const httpServer = http.createServer(app);

// Initialize Socket.IO with the HTTP server
initializeSocket(httpServer);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('✅ Database connection successful');

    // Initialize background jobs
    startExpiryJob();
    startNotificationJob();
    startDailyReportsJob();
    startCleanupJob();
    logger.info('✅ Background jobs initialized');

    // Start HTTP server (not app.listen)
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 SaveTheServe Server Started');
      console.log('================================');
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
      console.log(`🚪 Port: ${PORT}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`🔌 Socket.IO: http://localhost:${PORT}`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
      console.log('================================');
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\n🛑 Shutting down gracefully...');
      httpServer.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
