import mongoose from 'mongoose';
import { env } from './env.js';

// Cache connection for serverless environments (Vercel, etc.)
let cachedConnection: typeof mongoose | null = null;

export const connectDB = async () => {
  try {
    // Reuse existing connection in serverless environments
    if (cachedConnection && mongoose.connection.readyState === 1) {
      return cachedConnection;
    }

    // Connection options optimized for serverless (Vercel)
    // Note: bufferCommands and bufferMaxEntries are deprecated in newer Mongoose versions
    const options = {
      serverSelectionTimeoutMS: 10000, // 10s timeout for serverless (Vercel free tier limit)
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      connectTimeoutMS: 10000, // 10s connection timeout
      maxPoolSize: 1, // Single connection for serverless (reduces overhead)
      minPoolSize: 0, // No minimum for serverless (connections are ephemeral)
      heartbeatFrequencyMS: 10000, // Check connection health every 10s
      retryWrites: true,
      retryReads: true,
    };

    const connection = await mongoose.connect(env.MONGO_URI, options);
    cachedConnection = connection;
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully');
      console.log(`   Database: ${mongoose.connection.db?.databaseName}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    // Handle app termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    console.log('MongoDB connection established');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('\n💡 Make sure MongoDB is running:');
    console.error('   - Using Docker: sudo docker compose up -d mongo');
    console.error('   - Or install MongoDB locally and start the service');
    throw error;
  }
};

