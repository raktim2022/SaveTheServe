import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data in dependency order (children first)
  try {
    await prisma.adminLog.deleteMany();
    await prisma.cityStats.deleteMany();
    await prisma.review.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.pickupLog.deleteMany();
    await prisma.foodRequest.deleteMany();
    await prisma.foodListing.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.nGO.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.user.deleteMany();
    console.log('🗑️ Cleared existing data');
  } catch (error) {
    console.log('ℹ️ No existing data to clear:', error.message);
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

  // ── Food Requests (one completed, one pending) ──────────────────────
  const completedRequest = await prisma.foodRequest.create({
    data: {
      ngoId: ngo1.id,
      foodListingId: foodListing1.id,
      status: 'COMPLETED',
      pickupTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      pickupOtpVerified: true,
    },
  });

  const pendingRequest = await prisma.foodRequest.create({
    data: {
      ngoId: ngo2.id,
      foodListingId: foodListing2.id,
      status: 'ACCEPTED',
      pickupOtp: '482910',
      pickupOtpExpiry: new Date(Date.now() + 30 * 60 * 1000), // 30 min
    },
  });

  console.log('📋 Created 2 Food Requests');

  // ── Reviews ────────────────────────────────────────────────────────
  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Incredible organisation — food was fresh and handover was smooth!',
      reviewerId: ngoUser1.id,
      reviewerRole: 'NGO',
      restaurantId: restaurant1.id,
      foodRequestId: completedRequest.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 4,
      comment: 'Great NGO, very punctual and professional volunteers.',
      reviewerId: restaurantUser1.id,
      reviewerRole: 'RESTAURANT',
      ngoId: ngo1.id,
      foodRequestId: completedRequest.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Love how easy the platform makes it to donate surplus food.',
      reviewerId: ngoUser2.id,
      reviewerRole: 'NGO',
      restaurantId: restaurant2.id,
    },
  });

  console.log('⭐ Created 3 Reviews');

  // ── CityStats ──────────────────────────────────────────────────────
  await prisma.cityStats.createMany({
    data: [
      { city: 'Mumbai', totalDonations: 312, totalMealsRescued: 18700, totalPeopleFed: 4200, activeRestaurants: 47, activeNgos: 12, co2SavedKg: 2340.50 },
      { city: 'Delhi', totalDonations: 198, totalMealsRescued: 11200, totalPeopleFed: 2800, activeRestaurants: 31, activeNgos: 9, co2SavedKg: 1450.00 },
      { city: 'Bangalore', totalDonations: 143, totalMealsRescued: 8500, totalPeopleFed: 1900, activeRestaurants: 22, activeNgos: 7, co2SavedKg: 980.75 },
      { city: 'Chennai', totalDonations: 87, totalMealsRescued: 5100, totalPeopleFed: 1200, activeRestaurants: 14, activeNgos: 5, co2SavedKg: 612.30 },
    ],
  });

  console.log('🏙️ Created 4 CityStats rows');

  // ── Notifications ──────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: ngoUser1.id, type: 'request:status_changed', title: 'Pickup Completed!', body: 'Your food pickup from Grand Palace Hotel has been successfully completed.', channel: 'IN_APP', isRead: true },
      { userId: ngoUser2.id, type: 'food:new', title: 'New Food Available Nearby', body: 'Tasty Treats has listed fresh bread and pastries — request before it expires!', channel: 'IN_APP' },
      { userId: restaurantUser1.id, type: 'request:new', title: 'New Pickup Request', body: 'Feed The Hungry Foundation has requested your buffet surplus listing.', channel: 'IN_APP', isRead: true },
      { userId: restaurantUser2.id, type: 'request:status_changed', title: 'Request Accepted', body: 'Hope Kitchen Initiative has accepted your food listing.', channel: 'IN_APP' },
      { userId: adminUser.id, type: 'notification', title: 'New Restaurant Registered', body: 'A new restaurant has signed up and is awaiting verification.', channel: 'IN_APP' },
      { userId: ngoUser3.id, type: 'food:new', title: 'Listings Available in Your Area', body: 'There are 3 active food listings within 10 km of your NGO.', channel: 'IN_APP' },
    ],
  });

  console.log('🔔 Created 6 Notifications');

  // ── AdminLogs ─────────────────────────────────────────────────────
  const adminRecord = await prisma.admin.findUnique({ where: { userId: adminUser.id } });

  await prisma.adminLog.createMany({
    data: [
      { adminId: adminRecord.id, action: 'VERIFY_RESTAURANT', targetType: 'Restaurant', targetId: restaurant1.id, details: { reason: 'Documents verified', verifiedBy: 'admin@savetheserve.com' }, ipAddress: '127.0.0.1' },
      { adminId: adminRecord.id, action: 'VERIFY_RESTAURANT', targetType: 'Restaurant', targetId: restaurant2.id, details: { reason: 'Documents verified', verifiedBy: 'admin@savetheserve.com' }, ipAddress: '127.0.0.1' },
      { adminId: adminRecord.id, action: 'VERIFY_NGO', targetType: 'NGO', targetId: ngo1.id, details: { reason: 'NGO registration documents accepted' }, ipAddress: '127.0.0.1' },
    ],
  });

  console.log('📝 Created 3 AdminLogs');

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- 1 Admin user + 3 AdminLogs');
  console.log('- 3 NGOs');
  console.log('- 2 Restaurants');
  console.log('- 2 Food listings');
  console.log('- 2 Food requests (1 completed, 1 accepted)');
  console.log('- 3 Reviews');
  console.log('- 4 CityStats (Mumbai, Delhi, Bangalore, Chennai)');
  console.log('- 6 Notifications');
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