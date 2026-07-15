import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { config } from './config/config.js';

/**
 * FinanceLab API Server - Day 4
 * 
 * Improvements from Day 3:
 * - Centralized configuration with Zod validation
 * - Type-safe environment variables
 * - Fail-fast validation at startup
 * - Structured error handling
 * - Request logging middleware
 */

// Initialize Express application
const app = express();

// Initialize Prisma Client with validated database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.database.url,
    },
  },
});

// ============================================
// Middleware
// ============================================

/**
 * Request Logging Middleware
 * 
 * Logs all incoming requests with method, path, and timestamp
 * Essential for debugging and monitoring
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

/**
 * JSON Body Parser
 * 
 * Parses incoming JSON request bodies
 * Required for POST/PUT endpoints
 */
app.use(express.json());

// ============================================
// Routes
// ============================================

/**
 * Health Check Endpoint
 * 
 * Enhanced version with configuration info
 */
app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'ok',
      database: 'connected',
      environment: config.server.env,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      environment: config.server.env,
      timestamp: new Date().toISOString(),
      message: 'Database connection failed',
    });
  }
});

/**
 * Root Endpoint
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'FinanceLab API',
    version: '1.0.0',
    status: 'operational',
    environment: config.server.env,
    documentation: {
      health: '/health',
      api: 'See docs/API.md for full documentation',
    },
    technologies: [
      'Express.js',
      'TypeScript',
      'Prisma ORM',
      'PostgreSQL (Supabase)',
      'Zod Validation',
    ],
  });
});

/**
 * Get All Users
 */
app.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: {
          select: { portfolios: true },
        },
      },
    });

    res.json({
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Create User (Demo endpoint)
 * In production, this would include input validation and password hashing
 */
app.post('/users', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.create({
      data: {
        email: 'demo@financelab.com',
        password: 'hashed_password_will_go_here',
        name: 'Demo User',
      },
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(500).json({
      error: 'Failed to create user',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================
// Error Handling
// ============================================

/**
 * 404 Handler
 * Catches requests to undefined routes
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: ['/health', '/users'],
  });
});

/**
 * Global Error Handler
 * Catches all unhandled errors
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.server.isDevelopment ? err.message : 'Something went wrong',
  });
});

// ============================================
// Server Startup
// ============================================

app.listen(config.server.port, () => {
  console.log('🚀 FinanceLab API server running');
  console.log(`📡 Local:   http://localhost:${config.server.port}`);
  console.log(`📊 Health:  http://localhost:${config.server.port}/health`);
  console.log(`👥 Users:   http://localhost:${config.server.port}/users`);
  console.log('');
  console.log('Configuration:');
  console.log(`  Environment: ${config.server.env}`);
  console.log(`  Port:        ${config.server.port}`);
  console.log(`  Node.js:     ${process.version}`);
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

// ============================================
// Graceful Shutdown
// ============================================

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});
