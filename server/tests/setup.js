import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase, getPrismaClient } from '../src/config/db.config.js';

// Force test environment
process.env.NODE_ENV = 'test';
// Use the same database as development for now
const testDatabaseUrl = 'postgresql://postgres:Raktim05@@localhost:5432/savetheserve';
process.env.DATABASE_URL = testDatabaseUrl;
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';

// Setup test database before all tests
beforeAll(async () => {
  // Connect to database using our connection function
  await connectDatabase();
  
  // Clean the test database
  await cleanDatabase();
  
  // Create test data
  await createTestData();
});

// Clean database after all tests
afterAll(async () => {
  await cleanDatabase();
  await disconnectDatabase();
});

// Clean database before each test
beforeEach(async () => {
  // Clean transactional data only (keep users, restaurants, NGOs)
  try {
    const prisma = getPrismaClient();
    await prisma.adminLog.deleteMany();
    await prisma.cityStats.deleteMany();
    await prisma.review.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.pickupLog.deleteMany();
    await prisma.foodRequest.deleteMany();
    await prisma.foodListing.deleteMany();
    await prisma.volunteer.deleteMany();
  } catch (error) {
    // Ignore errors if tables don't exist
  }
});

async function cleanDatabase() {
  const prisma = getPrismaClient();
  const deleteOrder = [
    'adminLog',
    'cityStats',
    'review',
    'notification',
    'payment',
    'pickupLog',
    'foodRequest',
    'foodListing',
    'volunteer',
    'restaurant',
    'nGO',
    'admin',
    'user',
  ];

  for (const model of deleteOrder) {
    try {
      await prisma[model].deleteMany();
    } catch (error) {
      console.warn(`Warning: Could not clear ${model}:`, error.message);
    }
  }
}

async function createTestData() {
  try {
    const prisma = getPrismaClient();
    const hashedPassword = await bcrypt.hash('testpass123', 12);

    // Create test admin
    global.testAdmin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        name: 'Test Admin',
        phone: '+1234567890',
        role: 'ADMIN',
        isVerified: true,
        // Don't set verification token for test users
      },
    });

    await prisma.admin.create({
      data: { userId: global.testAdmin.id },
    });

    // Create test NGO
    global.testNgoUser = await prisma.user.create({
      data: {
        email: 'ngo@test.com',
        password: hashedPassword,
        name: 'Test NGO',
        phone: '+1234567891',
        role: 'NGO',
        isVerified: true,
      },
    });

    global.testNgo = await prisma.nGO.create({
      data: {
        userId: global.testNgoUser.id,
        ngoName: 'Test NGO Foundation',
        address: 'Test Address, Test City',
        latitude: 19.0760,
        longitude: 72.8777,
        coverageRadiusKm: 5.0,
      },
    });

    // Create test restaurant
    global.testRestaurantUser = await prisma.user.create({
      data: {
        email: 'restaurant@test.com',
        password: hashedPassword,
        name: 'Test Restaurant',
        phone: '+1234567892',
        role: 'RESTAURANT',
        isVerified: true,
      },
    });

    global.testRestaurant = await prisma.restaurant.create({
      data: {
        userId: global.testRestaurantUser.id,
        shopName: 'Test Restaurant Ltd',
        shopType: 'Restaurant',
        address: 'Test Restaurant Address',
        latitude: 19.0760,
        longitude: 72.8777,
        verified: true,
      },
    });
  } catch (error) {
    console.error('Error creating test data:', error);
    throw error;
  }
}

// Export Prisma client getter for use in tests
global.getPrismaClient = getPrismaClient;