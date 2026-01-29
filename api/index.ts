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

// Connection timeout for serverless (Vercel free tier: 10s, Pro: 60s)
const INIT_TIMEOUT = 8000; // 8s to leave buffer for request processing

async function initializeWithTimeout(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Database initialization timeout'));
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize MongoDB connection on first invocation with timeout protection
  if (!isInitialized && !isInitializing) {
    isInitializing = true;
    try {
      // Check if connection already exists (from previous invocation)
      if (mongoose.connection.readyState === 1) {
        console.log('✅ Reusing existing MongoDB connection');
        isInitialized = true;
        isInitializing = false;
      } else {
        console.log('🔄 Initializing MongoDB connection...');
        await initializeWithTimeout();
        isInitialized = true;
        isInitializing = false;
        console.log('✅ MongoDB connection initialized');
      }
      
      // Create serverless handler after app is initialized
      if (!serverlessHandler) {
        serverlessHandler = serverless(app, {
          binary: ['image/*', 'application/pdf'],
        });
      }
    } catch (error) {
      isInitializing = false;
      console.error('❌ Failed to initialize app:', error);
      return res.status(503).json({ 
        error: 'Service temporarily unavailable', 
        message: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        retry: true
      });
    }
  } else if (isInitializing) {
    // Wait for initialization to complete
    let attempts = 0;
    while (isInitializing && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    if (!isInitialized) {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable', 
        message: 'Database initialization in progress',
        retry: true
      });
    }
  }

  // Use serverless-http to handle the request
  if (!serverlessHandler) {
    return res.status(500).json({ error: 'Handler not initialized' });
  }

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
