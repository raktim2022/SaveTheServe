import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Force test environment
process.env.NODE_ENV = 'test';
// URL encode the special characters in the password - use production DB as it's empty
const testDatabaseUrl = 'postgresql://postgres:Raktim05%40@localhost:5432/SaveTheServe';
process.env.DATABASE_URL = testDatabaseUrl;
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';

const prisma = new PrismaClient({
  datasourceUrl: testDatabaseUrl
});

// Setup test database before all tests
beforeAll(async () => {
  // Clean the test database
  await cleanDatabase();
  
  // Create test data
  await createTestData();
});

// Clean database after all tests
afterAll(async () => {
  await cleanDatabase();
  await prisma.$disconnect();
});

// Clean database before each test
beforeEach(async () => {
  // Clean transactional data only (keep users, restaurants, NGOs)
  try {
    await prisma.pickupLog.deleteMany();
    await prisma.foodRequest.deleteMany();
    await prisma.foodListing.deleteMany();
  } catch (error) {
    // Ignore errors if tables don't exist
  }
});

async function cleanDatabase() {
  const deleteOrder = [
    'pickupLog',
    'foodRequest', 
    'foodListing',
    'restaurant',
    'nGO',
    'admin',
    'user'
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

// Export Prisma instance for use in tests
global.prisma = prisma;