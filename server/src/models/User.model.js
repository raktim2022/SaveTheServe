import getPrismaClient from '../config/db.config.js';

/**
 * User model operations
 * Roles: ADMIN | NGO | RESTAURANT
 */
export const UserModel = {
  // Create a new user
  async create(userData) {
    const prisma = getPrismaClient();
    return await prisma.user.create({
      data: userData,
    });
  },

  // Find user by email
  async findByEmail(email) {
    const prisma = getPrismaClient();
    return await prisma.user.findUnique({
      where: { email },
      include: {
        admin: true,
        ngo: true,
        restaurant: true,
        volunteer: true,
      },
    });
  },

  // Find user by ID
  async findById(id) {
    const prisma = getPrismaClient();
    return await prisma.user.findUnique({
      where: { id },
      include: {
        admin: true,
        ngo: true,
        restaurant: true,
        volunteer: true,
      },
    });
  },

  // Update user
  async update(id, updateData) {
    const prisma = getPrismaClient();
    return await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
    });
  },

  // Delete user
  async delete(id) {
    const prisma = getPrismaClient();
    return await prisma.user.delete({
      where: { id },
    });
  },

  // Find all users with pagination
  async findAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    const prisma = getPrismaClient();
    
    return await prisma.user.findMany({
      where: filters,
      skip,
      take: limit,
      include: {
        admin: true,
        ngo: true,
        restaurant: true,
        volunteer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Count total users
  async count(filters = {}) {
    const prisma = getPrismaClient();
    return await prisma.user.count({
      where: filters,
    });
  },
};
