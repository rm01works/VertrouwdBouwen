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

