import { getPrismaClient } from '../config/db.config.js';

// Lazy proxy - always retrieves the initialized Prisma client
const prisma = new Proxy({}, { get: (_, prop) => getPrismaClient()[prop] });

// Donor = Restaurant in the domain language
export const RestaurantModel = {
  // Create restaurant profile
  async create(restaurantData) {
    return await prisma.restaurant.create({
      data: restaurantData,
      include: {
        user: true,
      },
    });
  },

  // Find restaurant by user ID
  async findByUserId(userId) {
    return await prisma.restaurant.findUnique({
      where: { userId },
      include: {
        user: true,
        foodListings: {
          include: {
            requests: true,
          },
        },
      },
    });
  },

  // Find restaurant by ID
  async findById(id) {
    return await prisma.restaurant.findUnique({
      where: { id },
      include: {
        user: true,
        foodListings: {
          include: {
            requests: true,
          },
        },
      },
    });
  },

  // Find restaurants near location
  async findNearby(latitude, longitude, radiusKm = 10) {
    // Note: For production, consider using PostGIS extensions for better geospatial queries
    return await prisma.restaurant.findMany({
      where: {
        verified: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        foodListings: {
          where: {
            status: 'AVAILABLE',
            expiryTime: {
              gt: new Date(),
            },
          },
        },
      },
    });
  },

  // Update restaurant
  async update(id, updateData) {
    return await prisma.restaurant.update({
      where: { id },
      data: updateData,
    });
  },

  // Get all restaurants
  async findAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    
    return await prisma.restaurant.findMany({
      where: filters,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            foodListings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Delete restaurant
  async delete(id) {
    return await prisma.restaurant.delete({
      where: { id },
    });
  },
};
