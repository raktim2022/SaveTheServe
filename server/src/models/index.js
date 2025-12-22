// Central exports for all Prisma models
export { UserModel } from './User.model.js';
export { AdminModel } from './Admin.model.js';
export { RestaurantModel } from './Donor.model.js';
export { NGOModel } from './NGO.model.js';
export { FoodListingModel } from './FoodListing.model.js';
export { FoodRequestModel } from './Request.model.js';
export { PickupLogModel } from './Pickup.model.js';

// Re-export Prisma client for direct database access
export { default as prisma } from '../config/db.config.js';

// Utility function to disconnect Prisma client
export async function disconnectDatabase() {
  const { default: prisma } = await import('../config/db.config.js');
  await prisma.$disconnect();
}

// Utility function to check database connection
export async function checkDatabaseConnection() {
  try {
    const { default: prisma } = await import('../config/db.config.js');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}