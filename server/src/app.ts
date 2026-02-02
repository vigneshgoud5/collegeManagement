import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { errorHandler } from './utils/errors.js';
import { connectDB } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import studentSelfRoutes from './routes/studentSelfRoutes.js';
import studentsAdminRoutes from './routes/studentsAdminRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import {
  securityHeaders,
  apiRateLimiter,
  sanitizeInput,
  validateRequestSize,
} from './middleware/security.js';

export const app = express();

// Initialize MongoDB connection
export const initializeApp = async () => {
  try {
    console.log(`Connecting to MongoDB at ${env.MONGO_URI}`);
    await connectDB();
  } catch (error) {
    console.error('Failed to initialize MongoDB connection:', error);
    throw error;
  }
};

// Security middleware (applied first)
app.use(securityHeaders);
app.use(validateRequestSize);

// Health check endpoint - no rate limiting, responds immediately
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Apply rate limiting to other routes
app.use(apiRateLimiter);
app.use(sanitizeInput);

// CORS configuration - support multiple origins for Vercel preview deployments
const getAllowedOrigins = (): string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void) => {
  const origins: string[] = [env.CLIENT_ORIGIN];
  
  // Add additional origins from CLIENT_ORIGINS if provided (comma-separated)
  if (env.CLIENT_ORIGINS) {
    const additionalOrigins = env.CLIENT_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean);
    origins.push(...additionalOrigins);
  }
  
  // In production, use a function to dynamically allow Vercel preview URLs
  if (env.NODE_ENV === 'production') {
    return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, false);
      
      // Allow exact matches
      if (origins.includes(origin)) {
        return callback(null, true);
      }
      
      // Allow Vercel preview URLs (pattern matching)
      const vercelPreviewPattern = /^https:\/\/.*\.vercel\.app$/;
      if (vercelPreviewPattern.test(origin)) {
        return callback(null, true);
      }
      
      callback(null, false);
    };
  }
  
  return origins;
};

app.use(cors({
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 image uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentSelfRoutes);
app.use('/api/students', studentsAdminRoutes);
app.use('/api/faculty', facultyRoutes);

app.use(errorHandler);


