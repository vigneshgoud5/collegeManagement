import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';
// Import from built server code (dist folder)
// Note: Server must be built before deployment (handled by build:vercel script)
import { app, initializeApp } from '../server/dist/app.js';
import mongoose from 'mongoose';

// Initialize MongoDB connection (cached across invocations in serverless)
let isInitialized = false;
let isInitializing = false;
let serverlessHandler: ReturnType<typeof serverless> | null = null;
let initPromise: Promise<void> | null = null;

// Connection timeout for serverless (Vercel free tier: 10s, Pro: 60s)
const INIT_TIMEOUT = 5000; // 5s timeout - reduced for faster failure

// Routes that don't require database connection
const NO_DB_ROUTES = ['/api/health'];

async function initializeWithTimeout(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Database initialization timeout after 5s'));
    }, INIT_TIMEOUT);

    try {
      await initializeApp();
      clearTimeout(timeout);
      resolve();
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
}

async function ensureInitialized(): Promise<void> {
  // If already initialized, return immediately
  if (isInitialized && mongoose.connection.readyState === 1) {
    return;
  }

  // If initialization is in progress, wait for it
  if (isInitializing && initPromise) {
    return initPromise;
  }

  // Start new initialization
  isInitializing = true;
  initPromise = (async () => {
    try {
      // Check if connection already exists (from previous invocation)
      if (mongoose.connection.readyState === 1) {
        console.log('✅ Reusing existing MongoDB connection');
        isInitialized = true;
        isInitializing = false;
        return;
      }

      console.log('🔄 Initializing MongoDB connection...');
      await initializeWithTimeout();
      isInitialized = true;
      isInitializing = false;
      console.log('✅ MongoDB connection initialized');
    } catch (error) {
      isInitializing = false;
      isInitialized = false;
      console.error('❌ Failed to initialize app:', error);
      throw error;
    }
  })();

  return initPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract path from request (handle both req.url and req.path)
  // Remove query string if present
  const rawPath = req.url || req.path || '';
  const path = rawPath.split('?')[0]; // Remove query string
  
  // For health endpoint, respond immediately without any serverless handler overhead
  // This must be checked FIRST before any imports or initialization
  // Handle various path formats: /api/health, /health, health, etc.
  const isHealthEndpoint = 
    path === '/api/health' || 
    path === '/health' ||
    path.endsWith('/api/health') ||
    path.endsWith('/health') ||
    path.includes('/health');
  
  if (isHealthEndpoint && req.method === 'GET') {
    // Respond immediately without checking DB or initializing anything
    // Use try-catch to handle any potential mongoose import issues
    try {
      const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      return res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        db: dbStatus,
        uptime: process.uptime()
      });
    } catch (error) {
      // If mongoose check fails, still return ok status
      return res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        db: 'unknown',
        uptime: process.uptime()
      });
    }
  }

  // Check if this route requires database connection
  const requiresDB = !NO_DB_ROUTES.some(route => path.startsWith(route));

  // Create serverless handler (only for non-health routes)
  if (!serverlessHandler) {
    serverlessHandler = serverless(app, {
      binary: ['image/*', 'application/pdf'],
    });
  }

  // For routes that don't require DB, handle immediately
  if (!requiresDB) {
    try {
      return await serverlessHandler(req, res);
    } catch (error) {
      console.error('❌ Serverless handler error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // For routes that require DB, ensure connection is initialized
  try {
    await ensureInitialized();
  } catch (error) {
    // If DB initialization fails, return error but don't block health checks
    console.error('❌ Database connection failed:', error);
    return res.status(503).json({ 
      error: 'Service temporarily unavailable', 
      message: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      retry: true
    });
  }

  // Handle the request
  try {
    return await serverlessHandler(req, res);
  } catch (error) {
    console.error('❌ Serverless handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
