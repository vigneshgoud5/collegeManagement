import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';
// Import from built server code (dist folder)
// Note: Server must be built before deployment (handled by build:vercel script)
import { app, initializeApp } from '../server/dist/app.js';

// Initialize MongoDB connection (cached across invocations in serverless)
let isInitialized = false;
let serverlessHandler: ReturnType<typeof serverless> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize MongoDB connection on first invocation
  if (!isInitialized) {
    try {
      await initializeApp();
      isInitialized = true;
      // Create serverless handler after app is initialized
      serverlessHandler = serverless(app);
      console.log('✅ Serverless handler initialized');
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      return res.status(500).json({ 
        error: 'Internal server error', 
        message: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Use serverless-http to handle the request
  if (!serverlessHandler) {
    return res.status(500).json({ error: 'Handler not initialized' });
  }

  return serverlessHandler(req, res);
}
