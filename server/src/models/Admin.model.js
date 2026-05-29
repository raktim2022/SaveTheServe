import { getPrismaClient } from '../config/db.config.js';

// Lazy proxy - always retrieves the initialized Prisma client
const prisma = new Proxy({}, { get: (_, prop) => getPrismaClient()[prop] });

export const AdminModel = {
  // Create admin profile
  async create(adminData) {
    return await prisma.admin.create({
      data: adminData,
      include: {
        user: true,
      },
    });
  },

  // Find admin by user ID
  async findByUserId(userId) {
    return await prisma.admin.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });
  },

  // Find admin by ID
  async findById(id) {
    return await prisma.admin.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  },

  // Get all admins
  async findAll() {
    return await prisma.admin.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isVerified: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Delete admin
  async delete(id) {
    return await prisma.admin.delete({
      where: { id },
    });
  },
};
