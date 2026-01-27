import type { VercelRequest, VercelResponse } from '@vercel/node';
// Import from built server code (dist folder)
// Note: Server must be built before deployment (handled by build:vercel script)
import { app, initializeApp } from '../server/dist/app.js';

// Initialize MongoDB connection (cached across invocations in serverless)
let isInitialized = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize MongoDB connection on first invocation
  if (!isInitialized) {
    try {
      await initializeApp();
      isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize app:', error);
      return res.status(500).json({ 
        error: 'Internal server error', 
        message: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Handle the request with Express app
  return new Promise<void>((resolve, reject) => {
    app(req as any, res as any, (err?: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
