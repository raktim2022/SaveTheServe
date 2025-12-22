import prisma from '../config/db.config.js';

/**
 * User model operations
 * Roles: ADMIN | NGO | RESTAURANT
 */
export const UserModel = {
  // Create a new user
  async create(userData) {
    return await prisma.user.create({
      data: userData,
    });
  },

  // Find user by email
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        admin: true,
        ngo: true,
        restaurant: true,
      },
    });
  },

  // Find user by ID
  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        admin: true,
        ngo: true,
        restaurant: true,
      },
    });
  },

  // Update user
  async update(id, updateData) {
    return await prisma.user.update({
      where: { id },
      data: updateData,
    });
  },

  // Delete user
  async delete(id) {
    return await prisma.user.delete({
      where: { id },
    });
  },

  // Find all users with pagination
  async findAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    
    return await prisma.user.findMany({
      where: filters,
      skip,
      take: limit,
      include: {
        admin: true,
        ngo: true,
        restaurant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Count total users
  async count(filters = {}) {
    return await prisma.user.count({
      where: filters,
    });
  },
};
