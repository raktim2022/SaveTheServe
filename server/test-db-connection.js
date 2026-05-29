import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from './src/config/db.config.js';
import logger from './src/utils/logger.js';

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
  try {
    logger.info('🧪 Testing database connection...');
    logger.info(`📋 Database URL: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}`);
    
    // Try to connect
    const prisma = await connectDatabase();
    
    // Test a simple query
    await prisma.$queryRaw`SELECT version() as version`;
    logger.info('✅ Database test query successful');
    
    // Test user table access (if schema exists)
    try {
      const userCount = await prisma.user.count();
      logger.info(`👥 Found ${userCount} users in database`);
    } catch (error) {
      if (error.code === 'P2021') {
        logger.warn('⚠️  Table "User" does not exist. Run migrations first:');
        logger.warn('   npm run db:migrate');
      } else {
        throw error;
      }
    }
    
    logger.info('🎉 Database connection test completed successfully!');
    
  } catch (error) {
    logger.error('❌ Database connection test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      logger.error('💡 Suggestions:');
      logger.error('   1. Start PostgreSQL service');
      logger.error('   2. Check if PostgreSQL is running on localhost:5432');
      logger.error('   3. Verify database credentials in .env file');
    } else if (error.code === 'ENOTFOUND') {
      logger.error('💡 Suggestions:');
      logger.error('   1. Check your internet connection');
      logger.error('   2. Verify the database host is correct');
      logger.error('   3. Check if Aiven service is running');
    }
    
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

testDatabaseConnection();