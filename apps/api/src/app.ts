import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { validateEnv } from './config/env';
import { env } from './config/env';
import { AppError } from './utils/errors';

export const app = express();

// CORS middleware (moet vóór andere middleware komen)
// Support multiple origins (comma-separated) and handle variations
const parseCorsOrigins = (corsOrigin: string): string[] => {
  return corsOrigin
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0)
    .map(origin => origin.endsWith('/') ? origin.slice(0, -1) : origin);
};

const allowedOrigins = parseCorsOrigins(env.CORS_ORIGIN);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    const isAllowed = allowedOrigins.some(allowed => {
      const normalizedAllowed = allowed.endsWith('/') ? allowed.slice(0, -1) : allowed;
      return normalizedOrigin === normalizedAllowed;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type'],
  maxAge: 86400,
}));

// Security middleware (configureer helmet om CORS niet te blokkeren)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));

// Environment validation middleware - runs on first request
// This prevents module load failures in serverless environments
let envValidated = false;
app.use((req, res, next) => {
  if (!envValidated) {
    try {
      validateEnv();
      envValidated = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Environment validation failed:', errorMessage);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Server configuratie fout: ' + errorMessage,
        },
      });
    }
  }
  next();
});

// Cookie parser middleware (voor httpOnly cookies)
app.use(cookieParser());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/', routes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'VertrouwdBouwen API',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      health: '/health',
    },
  });
});

// 404 Handler
app.use(notFoundHandler);

// Error Handler (moet als laatste)
app.use(errorHandler);

