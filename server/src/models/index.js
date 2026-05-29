// Central exports for all Prisma models
export { UserModel } from './User.model.js';
export { VolunteerModel } from './Volunteer.model.js';
export { AdminModel } from './Admin.model.js';
export { RestaurantModel } from './Donor.model.js';
export { NGOModel } from './NGO.model.js';
export { FoodListingModel } from './FoodListing.model.js';
export { FoodRequestModel } from './Request.model.js';
export { PickupLogModel } from './Pickup.model.js';
export { ReviewModel } from './Review.model.js';

// Re-export Prisma client for direct database access
export { getPrismaClient as prisma, getPrismaClient, connectDatabase, disconnectDatabase } from '../config/db.config.js';

// Utility function to check database connection
export async function checkDatabaseConnection() {
  try {
    const { getPrismaClient } = await import('../config/db.config.js');
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}