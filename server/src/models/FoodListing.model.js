import { getPrismaClient } from '../config/db.config.js';

// Lazy proxy - always retrieves the initialized Prisma client
const prisma = new Proxy({}, { get: (_, prop) => getPrismaClient()[prop] });

export const FoodListingModel = {
  // Create food listing
  async create(foodData) {
    return await prisma.foodListing.create({
      data: foodData,
      include: {
        restaurant: {
          include: {
            user: true,
          },
        },
      },
    });
  },

  // Find food listing by ID
  async findById(id) {
    return await prisma.foodListing.findUnique({
      where: { id },
      include: {
        restaurant: {
          include: {
            user: true,
          },
        },
        requests: {
          include: {
            ngo: {
              include: {
                user: true,
              },
            },
            pickupLog: true,
          },
        },
      },
    });
  },

  // Find available food listings
  async findAvailable(filters = {}) {
    return await prisma.foodListing.findMany({
      where: {
        status: 'AVAILABLE',
        expiryTime: {
          gt: new Date(),
        },
        ...filters,
      },
      include: {
        restaurant: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        expiryTime: 'asc',
      },
    });
  },

  // Generic findMany helper
  async findMany(options) {
    const { offset, limit, where, include, orderBy } = options;
    return await prisma.foodListing.findMany({
      where,
      skip: offset,
      take: limit,
      include,
      orderBy,
    });
  },

  // Generic count helper
  async count(options) {
    return await prisma.foodListing.count({
      where: options.where || options,
    });
  },

  // Find food listings by restaurant
  async findByRestaurant(restaurantId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    return await prisma.foodListing.findMany({
      where: { restaurantId },
      skip,
      take: limit,
      include: {
        requests: {
          include: {
            ngo: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Update food listing
  async update(id, updateData) {
    return await prisma.foodListing.update({
      where: { id },
      data: updateData,
    });
  },

  // Update status
  async updateStatus(id, status) {
    return await prisma.foodListing.update({
      where: { id },
      data: { status },
    });
  },

  // Delete food listing
  async delete(id) {
    return await prisma.foodListing.delete({
      where: { id },
    });
  },

  // Find expired food listings
  async findExpired() {
    return await prisma.foodListing.findMany({
      where: {
        expiryTime: {
          lt: new Date(),
        },
        status: {
          in: ['AVAILABLE', 'REQUESTED'],
        },
      },
    });
  },

  // Get statistics
  async getStats(restaurantId = null) {
    const where = restaurantId ? { restaurantId } : {};
    
    const [total, available, requested, picked] = await Promise.all([
      prisma.foodListing.count({ where }),
      prisma.foodListing.count({ where: { ...where, status: 'AVAILABLE' } }),
      prisma.foodListing.count({ where: { ...where, status: 'REQUESTED' } }),
      prisma.foodListing.count({ where: { ...where, status: 'PICKED' } }),
    ]);
    
    return { total, available, requested, picked };
  },
};
