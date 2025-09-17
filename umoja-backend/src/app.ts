import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testDatabaseConnection } from './config/database';

// Load environment variables first
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint with database test
app.get('/health', async (req, res) => {
  try {
    const dbStatus = await testDatabaseConnection();
    
    res.status(dbStatus ? 200 : 500).json({
      status: dbStatus ? 'OK' : 'ERROR',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus ? 'Connected' : 'Disconnected',
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Basic API endpoint
app.get('/api/status', (req, res) => {
  res.json({
    message: 'Umoja Trivia API is running locally!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: 'MySQL Local',
  });
});

// Database test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const dbConnected = await testDatabaseConnection();
    res.json({
      success: dbConnected,
      message: dbConnected ? 'Database connection successful' : 'Database connection failed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error:', error);
  
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});


// 404 handler without wildcard
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🔄 Starting Umoja Trivia API Server...');
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('🔄 Testing database connection...');
    
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      console.error('❌ Cannot start server: Database connection failed');
      console.error('💡 Make sure MySQL is running and credentials in .env are correct');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 Umoja Trivia API Server Started Successfully!');
      console.log('');
      console.log(`🔗 Server URL: http://localhost:${PORT}`);
      console.log(`💊 Health Check: http://localhost:${PORT}/health`);
      console.log(`📊 API Status: http://localhost:${PORT}/api/status`);
      console.log(`🗃️  DB Test: http://localhost:${PORT}/api/db-test`);
      console.log('');
      console.log('✨ Ready for development! Press Ctrl+C to stop ✨');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;