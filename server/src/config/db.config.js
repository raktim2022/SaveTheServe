import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

let prisma;

const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  // Check if using placeholder password
  if (databaseUrl.includes('AIVEN_PASSWORD')) {
    logger.warn('⚠️  Using placeholder Aiven password. Falling back to local database.');
    const localDbUrl = 'postgresql://postgres:Raktim05@@localhost:5432/savetheserve';
    logger.info('🔄 Using local PostgreSQL database');
    
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      errorFormat: 'pretty',
      datasources: {
        db: {
          url: localDbUrl,
        },
      },
    });
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

const connectDatabase = async (retries = 3, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`🔄 Database connection attempt ${attempt}/${retries}...`);
      
      if (!prisma) {
        prisma = createPrismaClient();
      }
      
      // Test the connection with timeout
      const connectionPromise = Promise.all([
        prisma.$connect(),
        prisma.$queryRaw`SELECT 1 as test`
      ]);
      
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      );
      
      await Promise.race([connectionPromise, timeout]);
      
      logger.info('✅ Database connected successfully!');
      
      // Test basic table access if in development
      if (process.env.NODE_ENV === 'development') {
        try {
          await prisma.user.count();
          logger.info('📊 Database schema validated');
        } catch (schemaError) {
          logger.warn('⚠️  Database schema might need migration:', schemaError.message);
        }
      }
      
      return prisma;
      
    } catch (error) {
      logger.error(`❌ Database connection attempt ${attempt} failed:`, {
        message: error.message,
        code: error.code,
        meta: error.meta
      });
      
      // Cleanup failed connection
      if (prisma) {
        try {
          await prisma.$disconnect();
        } catch (disconnectError) {
          // Ignore disconnect errors
        }
        prisma = null;
      }
      
      if (attempt === retries) {
        if (error.message.includes('Connection timeout') || error.code === 'P1001') {
          logger.error('🚫 Database server unreachable. Please ensure:');
          logger.error('   - Database server is running');
          logger.error('   - Network connectivity is available');
          logger.error('   - Credentials are correct');
          logger.error('   - Firewall allows connections');
        }
        
        throw new Error(`Failed to connect to database after ${retries} attempts: ${error.message}`);
      }
      
      logger.info(`⏳ Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const disconnectDatabase = async () => {
  if (prisma) {
    try {
      await prisma.$disconnect();
      logger.info('🔌 Database disconnected');
    } catch (error) {
      logger.error('Error disconnecting database:', error.message);
    } finally {
      prisma = null;
    }
  }
};

const getPrismaClient = () => {
  if (!prisma) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return prisma;
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

export { prisma, connectDatabase, disconnectDatabase, getPrismaClient };
export default getPrismaClient;
