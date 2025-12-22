import prisma from '../config/db.config.js';

export const PickupLogModel = {
  // Create pickup log
  async create(pickupData) {
    return await prisma.pickupLog.create({
      data: pickupData,
      include: {
        foodRequest: {
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
        },
      },
    });
  },

  // Find pickup log by request ID
  async findByRequestId(foodRequestId) {
    return await prisma.pickupLog.findUnique({
      where: { foodRequestId },
      include: {
        foodRequest: {
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
        },
      },
    });
  },

  // Find pickup log by pickup code
  async findByPickupCode(pickupCode) {
    return await prisma.pickupLog.findUnique({
      where: { pickupCode },
      include: {
        foodRequest: {
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
        },
      },
    });
  },

  // Find pickup log by ID
  async findById(id) {
    return await prisma.pickupLog.findUnique({
      where: { id },
      include: {
        foodRequest: {
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
        },
      },
    });
  },

  // Update pickup status
  async updateStatus(id, pickupStatus) {
    return await prisma.pickupLog.update({
      where: { id },
      data: { 
        pickupStatus,
        timestamp: new Date(),
      },
    });
  },

  // Update pickup log
  async update(id, updateData) {
    return await prisma.pickupLog.update({
      where: { id },
      data: updateData,
    });
  },

  // Get all pickup logs with pagination
  async findAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    
    return await prisma.pickupLog.findMany({
      where: filters,
      skip,
      take: limit,
      include: {
        foodRequest: {
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
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  },

  // Delete pickup log
  async delete(id) {
    return await prisma.pickupLog.delete({
      where: { id },
    });
  },

  // Generate unique pickup code
  async generatePickupCode() {
    const { v4: uuidv4 } = await import('uuid');
    let code;
    let exists = true;
    
    while (exists) {
      code = uuidv4().substring(0, 8).toUpperCase();
      const existing = await prisma.pickupLog.findUnique({
        where: { pickupCode: code },
      });
      exists = !!existing;
    }
    
    return code;
  },
};
