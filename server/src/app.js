import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.config.js';
import { checkDatabaseConnection } from './models/index.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import apiRoutes from './routes/index.js';

const app = express();

// Trust proxy (important for deployment behind reverse proxy)
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: config.ALLOWED_ORIGINS,
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.NODE_ENV === 'development') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('common'));
}

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbStatus = await checkDatabaseConnection();
  
  res.json({
    success: true,
    message: 'SaveTheServe Server is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    database: dbStatus ? 'connected' : 'disconnected',
    version: '1.0.0',
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler for non-API routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
