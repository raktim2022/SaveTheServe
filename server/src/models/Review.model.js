import { getPrismaClient } from '../config/db.config.js';

// Lazy proxy - always retrieves the initialized Prisma client
const prisma = new Proxy({}, { get: (_, prop) => getPrismaClient()[prop] });

export const ReviewModel = {
  // Create a review
  async create(reviewData) {
    return await prisma.review.create({
      data: reviewData,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            shopName: true,
          },
        },
        ngo: {
          select: {
            id: true,
            ngoName: true,
          },
        },
      },
    });
  },

  // Find review by ID
  async findById(id) {
    return await prisma.review.findUnique({
      where: { id },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            shopName: true,
          },
        },
        ngo: {
          select: {
            id: true,
            ngoName: true,
          },
        },
      },
    });
  },

  // Find one review by conditions
  async findOne(conditions) {
    return await prisma.review.findFirst({
      where: conditions,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            shopName: true,
          },
        },
        ngo: {
          select: {
            id: true,
            ngoName: true,
          },
        },
      },
    });
  },

  // Find multiple reviews
  async findMany(options = {}) {
    const { where, include, orderBy, skip, take } = options;
    return await prisma.review.findMany({
      where,
      include: include || {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            shopName: true,
          },
        },
        ngo: {
          select: {
            id: true,
            ngoName: true,
          },
        },
      },
      orderBy: orderBy || { createdAt: 'desc' },
      skip,
      take,
    });
  },

  // Count reviews
  async count(where = {}) {
    return await prisma.review.count({ where });
  },

  // Update review
  async update(id, updateData) {
    return await prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            shopName: true,
          },
        },
        ngo: {
          select: {
            id: true,
            ngoName: true,
          },
        },
      },
    });
  },

  // Delete review
  async delete(id) {
    return await prisma.review.delete({
      where: { id },
    });
  },

  // Get average rating for a restaurant
  async getRestaurantAverageRating(restaurantId) {
    const result = await prisma.review.aggregate({
      where: { restaurantId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    return {
      averageRating: result._avg.rating || 0,
      totalReviews: result._count.rating || 0,
    };
  },

  // Get average rating for an NGO
  async getNgoAverageRating(ngoId) {
    const result = await prisma.review.aggregate({
      where: { ngoId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    return {
      averageRating: result._avg.rating || 0,
      totalReviews: result._count.rating || 0,
    };
  },
};

export default ReviewModel;
