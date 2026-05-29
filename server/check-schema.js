import { connectDatabase } from './src/config/db.config.js';

async function checkSchema() {
  try {
    const prisma = await connectDatabase();
    
    // Check what columns exist in users table
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    console.log('Users table columns:');
    console.table(columns);
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSchema();