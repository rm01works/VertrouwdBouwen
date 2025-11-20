import { Router } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './projects.routes';
import milestoneRoutes from './milestones.routes';
import paymentRoutes from './payments.routes';
import userRoutes from './users.routes';
import { prisma } from '../config/database';

const router = Router();

// Health check met database connectie test
router.get('/health', async (req, res) => {
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
router.use('/users', userRoutes);

export default router;

