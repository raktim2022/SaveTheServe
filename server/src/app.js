import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/env.config.js';
import { checkDatabaseConnection } from './models/index.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import { rateLimiter } from './middlewares/rateLimiter.middleware.js';
import apiRoutes from './routes/index.js';
import logger from './utils/logger.js';

const app = express();

// Trust proxy (important for deployment behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// ── Socket.IO bypass ────────────────────────────────────────────────────────
// Socket.IO attaches its own 'request' listener to the HTTP server.
// We must stop Express from handling /socket.io/* paths so it doesn't
// send a 404 before Socket.IO's handler can respond.
app.use((req, _res, next) => {
  if (req.path.startsWith('/socket.io')) return; // hand off to Socket.IO
  next();
});
// ─────────────────────────────────────────────────────────────────────────────

// Rate limiting middleware (applied globally)
app.use(rateLimiter);

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (config.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
  try {
    const dbStatus = await checkDatabaseConnection();
    
    res.json({
      success: true,
      message: 'SaveTheServe Server is running',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      database: dbStatus ? 'connected' : 'disconnected',
      version: '1.0.0',
      uptime: process.uptime(),
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Server health check failed',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      database: 'error',
      version: '1.0.0',
      error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

// API routes
app.use('/api', apiRoutes);

// 404 handler for non-API routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;