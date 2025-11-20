import express from 'express';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export const app = express();

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

