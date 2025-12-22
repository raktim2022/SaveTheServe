import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (skip if tables don't exist yet)
  try {
    await prisma.pickupLog.deleteMany();
    await prisma.foodRequest.deleteMany();
    await prisma.foodListing.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.nGO.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.user.deleteMany();
    console.log('🗑️ Cleared existing data');
  } catch (error) {
    console.log('ℹ️ No existing data to clear');
  }

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create Admin Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@savetheserve.com',
      password: hashedPassword,
      name: 'System Administrator',
      phone: '+1234567890',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  await prisma.admin.create({
    data: {
      userId: adminUser.id,
    },
  });

  console.log('👑 Created Admin user');

  // Create NGO Users and NGOs
  const ngoUser1 = await prisma.user.create({
    data: {
      email: 'help@feedthehungry.org',
      password: hashedPassword,
      name: 'Feed The Hungry',
      phone: '+1234567891',
      role: 'NGO',
      isVerified: true,
    },
  });

  const ngoUser2 = await prisma.user.create({
    data: {
      email: 'contact@hopekitchen.org',
      password: hashedPassword,
      name: 'Hope Kitchen',
      phone: '+1234567892',
      role: 'NGO',
      isVerified: true,
    },
  });

  const ngoUser3 = await prisma.user.create({
    data: {
      email: 'info@mealsonwheels.org',
      password: hashedPassword,
      name: 'Meals on Wheels',
      phone: '+1234567893',
      role: 'NGO',
      isVerified: true,
    },
  });

  const ngo1 = await prisma.nGO.create({
    data: {
      userId: ngoUser1.id,
      ngoName: 'Feed The Hungry Foundation',
      address: '123 Charity Street, Downtown, Mumbai',
      latitude: 19.0760,
      longitude: 72.8777,
      coverageRadiusKm: 5.0,
    },
  });

  const ngo2 = await prisma.nGO.create({
    data: {
      userId: ngoUser2.id,
      ngoName: 'Hope Kitchen Initiative',
      address: '456 Hope Avenue, Andheri, Mumbai',
      latitude: 19.1136,
      longitude: 72.8697,
      coverageRadiusKm: 7.5,
    },
  });

  const ngo3 = await prisma.nGO.create({
    data: {
      userId: ngoUser3.id,
      ngoName: 'Meals on Wheels Delhi',
      address: '789 Service Road, Connaught Place, New Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      coverageRadiusKm: 10.0,
    },
  });

  console.log('🏢 Created 3 NGOs');

  // Create Restaurant Users and Restaurants  
  const restaurantUser1 = await prisma.user.create({
    data: {
      email: 'contact@grandhotel.com',
      password: hashedPassword,
      name: 'Grand Palace Hotel',
      phone: '+1234567895',
      role: 'RESTAURANT',
      isVerified: true,
    },
  });

  const restaurantUser2 = await prisma.user.create({
    data: {
      email: 'manager@tastytreats.com',
      password: hashedPassword,
      name: 'Tasty Treats Restaurant',
      phone: '+1234567896',
      role: 'RESTAURANT',
      isVerified: true,
    },
  });

  const restaurant1 = await prisma.restaurant.create({
    data: {
      userId: restaurantUser1.id,
      shopName: 'Grand Palace Hotel & Resort',
      shopType: 'Hotel',
      address: '100 Luxury Lane, Marine Drive, Mumbai',
      latitude: 18.9220,
      longitude: 72.8201,
      verified: true,
    },
  });

  const restaurant2 = await prisma.restaurant.create({
    data: {
      userId: restaurantUser2.id,
      shopName: 'Tasty Treats Multi-Cuisine Restaurant',
      shopType: 'Restaurant',
      address: '25 Food Street, Bandra West, Mumbai',
      latitude: 19.0596,
      longitude: 72.8295,
      verified: true,
    },
  });

  console.log('🍽️ Created 2 Restaurants');

  // Create some Food Listings
  const foodListing1 = await prisma.foodListing.create({
    data: {
      restaurantId: restaurant1.id,
      foodName: 'Buffet Surplus from Wedding Event',
      quantity: 150,
      expiryTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      status: 'AVAILABLE',
    },
  });

  const foodListing2 = await prisma.foodListing.create({
    data: {
      restaurantId: restaurant2.id,
      foodName: 'Fresh Bread and Pastries',
      quantity: 80,
      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      status: 'AVAILABLE',
    },
  });

  console.log('🥘 Created 2 Food Listings');

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- 1 Admin user created');
  console.log('- 3 NGOs created');
  console.log('- 2 Restaurants created');
  console.log('- 2 Food listings created');
  console.log('\n🔑 Login credentials (password for all: password123):');
  console.log('Admin: admin@savetheserve.com');
  console.log('NGOs: help@feedthehungry.org, contact@hopekitchen.org, info@mealsonwheels.org');
  console.log('Restaurants: contact@grandhotel.com, manager@tastytreats.com');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });