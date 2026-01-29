import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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
app.use(apiRateLimiter);
app.use(sanitizeInput);

// CORS configuration
app.use(cors({
  origin: env.CLIENT_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 image uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentSelfRoutes);
app.use('/api/students', studentsAdminRoutes);
app.use('/api/faculty', facultyRoutes);

app.use(errorHandler);


