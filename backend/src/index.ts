import { createApp } from './app';
import { environment, validateEnvironment } from './config/environment';
import { logger } from './utils/logger';

// Validate environment variables
try {
  validateEnvironment();
} catch (error) {
  logger.error('Environment validation failed', error);
  process.exit(1);
}

const app = createApp();
const PORT = environment.port;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${environment.nodeEnv}`);
  logger.info(`JWT Expiry: ${environment.jwt.expiry}`);
  logger.info(`Python Engine URL: ${environment.pythonEngine.url}`);
  logger.info(`CORS Origins: ${environment.cors.origin.join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
