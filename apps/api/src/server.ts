import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/database';

dotenv.config();

const PORT = env.PORT;

// CORS middleware (moet vóór andere middleware komen)
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Security middleware (configureer helmet om CORS niet te blokkeren)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Database connection failed!');
    console.error('   Error:', errorMessage);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   1. Check if PostgreSQL is running:');
    console.error('      - macOS: brew services list | grep postgresql');
    console.error('      - Linux: sudo systemctl status postgresql');
    console.error('      - Windows: Check Services panel');
    console.error('');
    console.error('   2. Verify DATABASE_URL in apps/api/.env:');
    console.error('      Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public');
    console.error('      Example: postgresql://postgres:password@localhost:5432/vertrouwdbouwen?schema=public');
    console.error('');
    console.error('   3. Test connection manually:');
    console.error('      psql -U YOUR_USER -d YOUR_DATABASE -h localhost');
    console.error('');
    console.error('   4. Check database exists:');
    console.error('      psql -U postgres -c "\\l"');
    console.error('');
    throw error;
  }
}

// Start server
async function startServer() {
  try {
    // Test database connection first
    await testDatabaseConnection();
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`🌐 CORS enabled for: ${env.CORS_ORIGIN}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

