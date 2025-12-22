import prisma from '../config/db.config.js';

export const FoodRequestModel = {
  // Create food request
  async create(requestData) {
    return await prisma.foodRequest.create({
      data: requestData,
      include: {
        ngo: {
          include: {
            user: true,
          },
        },
        foodListing: {
          include: {
            restaurant: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  },

  // Find request by ID
  async findById(id) {
    return await prisma.foodRequest.findUnique({
      where: { id },
      include: {
        ngo: {
          include: {
            user: true,
          },
        },
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
    });
  },

  // Find requests by NGO
  async findByNGO(ngoId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    return await prisma.foodRequest.findMany({
      where: { ngoId },
      skip,
      take: limit,
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Find requests by food listing
  async findByFoodListing(foodListingId) {
    return await prisma.foodRequest.findMany({
      where: { foodListingId },
      include: {
        ngo: {
          include: {
            user: true,
          },
        },
        pickupLog: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  },

  // Find pending requests for restaurant
  async findPendingByRestaurant(restaurantId) {
    return await prisma.foodRequest.findMany({
      where: {
        status: 'PENDING',
        foodListing: {
          restaurantId,
        },
      },
      include: {
        ngo: {
          include: {
            user: true,
          },
        },
        foodListing: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  },

  // Update request status
  async updateStatus(id, status, pickupTime = null) {
    const updateData = { status };
    if (pickupTime) {
      updateData.pickupTime = pickupTime;
    }
    
    return await prisma.foodRequest.update({
      where: { id },
      data: updateData,
    });
  },

  // Update request
  async update(id, updateData) {
    return await prisma.foodRequest.update({
      where: { id },
      data: updateData,
    });
  },

  // Delete request
  async delete(id) {
    return await prisma.foodRequest.delete({
      where: { id },
    });
  },

  // Get request statistics
  async getStats(ngoId = null, restaurantId = null) {
    let where = {};
    
    if (ngoId) {
      where.ngoId = ngoId;
    }
    
    if (restaurantId) {
      where.foodListing = {
        restaurantId,
      };
    }
    
    const [total, pending, accepted, completed] = await Promise.all([
      prisma.foodRequest.count({ where }),
      prisma.foodRequest.count({ where: { ...where, status: 'PENDING' } }),
      prisma.foodRequest.count({ where: { ...where, status: 'ACCEPTED' } }),
      prisma.foodRequest.count({ where: { ...where, status: 'COMPLETED' } }),
    ]);
    
    return { total, pending, accepted, completed };
  },

  // Generic findOne method for service compatibility
  async findOne(options) {
    return await prisma.foodRequest.findFirst({
      where: options.where,
      include: options.include || {
        ngo: {
          include: {
            user: true,
          },
        },
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
    });
  },

  // Generic findMany method for service compatibility
  async findMany(options) {
    const { offset, limit, where, include, orderBy } = options;
    
    return await prisma.foodRequest.findMany({
      where,
      skip: offset,
      take: limit,
      include: include || {
        ngo: {
          include: {
            user: true,
          },
        },
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
      orderBy,
    });
  },

  // Generic count method for service compatibility
  async count(options) {
    return await prisma.foodRequest.count({
      where: options.where || options,
    });
  },
};
