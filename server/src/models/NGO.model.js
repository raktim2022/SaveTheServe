import prisma from '../config/db.config.js';

export const NGOModel = {
  // Create NGO profile
  async create(ngoData) {
    return await prisma.nGO.create({
      data: ngoData,
      include: {
        user: true,
      },
    });
  },

  // Find NGO by user ID
  async findByUserId(userId) {
    return await prisma.nGO.findUnique({
      where: { userId },
      include: {
        user: true,
        requests: {
          include: {
            foodListing: {
              include: {
                restaurant: {
                  include: {
                    user: true,
                  },
                },
              },
            },
            pickupLog: true,
          },
        },
      },
    });
  },

  // Find NGO by ID
  async findById(id) {
    return await prisma.nGO.findUnique({
      where: { id },
      include: {
        user: true,
        requests: {
          include: {
            foodListing: {
              include: {
                restaurant: true,
              },
            },
          },
        },
      },
    });
  },

  // Find NGOs that can service a location
  async findByServiceArea(latitude, longitude) {
    // Note: For production, consider using PostGIS extensions for better geospatial queries
    return await prisma.nGO.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  },

  // Update NGO
  async update(id, updateData) {
    return await prisma.nGO.update({
      where: { id },
      data: updateData,
    });
  },

  // Get all NGOs
  async findAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    
    return await prisma.nGO.findMany({
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
            requests: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Delete NGO
  async delete(id) {
    return await prisma.nGO.delete({
      where: { id },
    });
  },
};
