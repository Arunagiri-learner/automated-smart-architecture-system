import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB, checkDbConnection, disconnectDB } from './config/db';
import projectRoutes from './routes/projectRoutes';
import analysisRoutes from './routes/analysisRoutes';
import reportRoutes from './routes/reportRoutes';
import budgetRoutes from './routes/budgetRoutes';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// CORS configuration for Render + Vercel integration
const clientUrl = process.env.CLIENT_URL;
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

if (clientUrl) {
  allowedOrigins.push(clientUrl.replace(/\/$/, ''));
}

app.use(
  cors({
    origin: (origin, callback) => {
      // In dev or if origin is in allowed list or if clientUrl is wild-matched
      if (!origin || allowedOrigins.includes(origin) || !isProduction) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive CORS for cross-domain API access
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
const uploadDir = process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/budget', budgetRoutes);

// Health Check Endpoint for Deployment Health Monitors (Render / Vercel)
app.get('/api/health', (_req, res) => {
  const dbConnected = checkDbConnection();
  res.json({
    status: 'ok',
    system: 'AUTOMATED SMART ARCHITECTURE SYSTEM (ASAS) API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbConnected ? 'connected' : 'in-memory-fallback',
      atlasConfigured: !!process.env.MONGODB_URI,
    },
  });
});

// Production Error Handling Middleware
app.use(errorHandler);

import { LibreDwgService } from './services/libreDwgService';

// Connect Database & Start Server
const server = app.listen(PORT, async () => {
  console.log(`🚀 ASAS Production Backend running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  await connectDB();
  LibreDwgService.init().catch(console.error);
});

// Graceful Shutdown Handlers for Cloud Platforms (Render, Heroku, Docker)
const gracefulShutdown = async (signal: string) => {
  console.log(`\n⚠️ Received ${signal}. Initiating graceful shutdown...`);
  server.close(async () => {
    console.log('✅ HTTP server closed.');
    await disconnectDB();
    process.exit(0);
  });

  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
