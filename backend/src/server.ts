import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env, validateEnv } from './config/env';
import { testConnection, disconnectPrisma } from './config/prisma';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

// Initialize Express app
const app: Express = express();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logger

// API Routes
app.use('/api', routes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handling middleware - must be last
app.use(errorHandler);

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Validate environment variables
    validateEnv();

    // Test database connection
    await testConnection();

    // Start listening
    app.listen(env.PORT, () => {
      console.log('========================================');
      console.log(`🚀 Server running in ${env.NODE_ENV} mode`);
      console.log(`📡 Listening on port ${env.PORT}`);
      console.log(`🔗 API: http://localhost:${env.PORT}/api`);
      console.log(`💚 Health check: http://localhost:${env.PORT}/api/health`);
      console.log('========================================');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    await disconnectPrisma();
    console.log('✓ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
