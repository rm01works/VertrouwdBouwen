import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './projects.routes';
import milestoneRoutes from './milestones.routes';
import paymentRoutes from './payments.routes';
import payoutRoutes from './payouts.routes';
import userRoutes from './users.routes';
import adminRoutes from './admin.routes';
import notificationRoutes from './notifications.routes';
import { prisma } from '../config/database';

const router = Router();

// Health check met database connectie test
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Test database connectie
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    res.status(503).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Database health check endpoint (specifiek voor DB connectie)
router.get('/health/db', async (req: Request, res: Response) => {
  try {
    // Test database connectie met een simpele query
    const result = await prisma.$queryRaw<Array<{ one: number }>>`SELECT 1 as one`;
    
    // Check of DATABASE_URL is ingesteld
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    
    res.json({ 
      ok: true,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        urlConfigured: hasDatabaseUrl,
        queryResult: result[0]?.one === 1 ? 'success' : 'unexpected'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    console.error('❌ Database health check failed:', errorMessage);
    
    // Check voor specifieke database errors
    const isConnectionError = 
      errorMessage.includes("Can't reach database server") ||
      errorMessage.includes('P1001') ||
      errorMessage.includes('P1000') ||
      errorMessage.includes('P1002') ||
      errorMessage.includes('P1003') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('Connection refused') ||
      errorMessage.includes('authentication failed') ||
      errorMessage.includes('does not exist');
    
    res.status(503).json({ 
      ok: false,
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        urlConfigured: !!process.env.DATABASE_URL,
        error: {
          name: errorName,
          message: errorMessage,
          type: isConnectionError ? 'connection_error' : 'unknown_error'
        }
      }
    });
  }
});

// API Routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/milestones', milestoneRoutes);
router.use('/payments', paymentRoutes);
router.use('/payouts', payoutRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

export default router;

