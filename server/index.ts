import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import hostingRoutes from './routes/hosting';
import domainRoutes from './routes/domains';
import orderRoutes from './routes/orders';
import billingRoutes from './routes/billing';
import supportRoutes from './routes/support';
import adminRoutes from './routes/admin';
import aiRoutes from './routes/ai';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();
import { prisma } from './utils/prisma';

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:", "data:"], // Allow blob and data URLs
      styleSrc: ["'self'", "'unsafe-inline'", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:"],
      imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
      connectSrc: ["'self'", "http:", "https:", "ws:", "wss:", "blob:"], // Allow WebSocket and blob
      frameSrc: ["'self'", "blob:"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for development
}));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://localhost:5173',
    'http://127.0.0.1:5173',
    'https://127.0.0.1:5173',
    'http://0.0.0.0:5173',
    'https://0.0.0.0:5173',
    // Allow any origin for development
    ...(process.env.NODE_ENV === 'development' ? [true] : [])
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  exposedHeaders: ['X-Total-Count'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hosting', hostingRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
// Serve frontend
app.use(express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), '../dist')));

// SPA fallback for non-API routes
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(path.dirname(fileURLToPath(import.meta.url)), '../dist/index.html'));
});

// 404 handler for API or if file not found
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'Route not found' });
  } else {
    // If we got here for a non-api route, likely index.html is missing or something went wrong? 
    // Or maybe we should just redirect to index.html?
    // Actually the previous handler catches '*' unless it's api.
    // So if we reach here, it must be an API route that wasn't handled previously (if next() was called)
    // OR it fell through.
    res.status(404).json({ error: 'Route not found' });
  }
});

const PORT = process.env.PORT || 3001;

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

export default app;
