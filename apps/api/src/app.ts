import express from 'express';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { validateEnv } from './config/env';
import { AppError } from './utils/errors';

export const app = express();

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
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'VertrouwdBouwen API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/api/health',
    },
  });
});

// 404 Handler
app.use(notFoundHandler);

// Error Handler (moet als laatste)
app.use(errorHandler);

