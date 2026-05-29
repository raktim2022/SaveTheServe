import { getPrismaClient } from '../config/db.config.js';

export const VolunteerModel = {
  // Create a new volunteer application
  async create(data) {
    const prisma = getPrismaClient();
    return await prisma.volunteer.create({
      data,
      include: { ngo: { include: { user: true } } },
    });
  },

  // Find volunteer by email (application email)
  async findByEmail(email) {
    const prisma = getPrismaClient();
    return await prisma.volunteer.findUnique({
      where: { email },
      include: { ngo: { include: { user: true } }, user: true },
    });
  },

  // Find volunteer by ID
  async findById(id) {
    const prisma = getPrismaClient();
    return await prisma.volunteer.findUnique({
      where: { id },
      include: { ngo: { include: { user: true } }, user: true },
    });
  },

  // Find volunteer by userId
  async findByUserId(userId) {
    const prisma = getPrismaClient();
    return await prisma.volunteer.findUnique({
      where: { userId },
      include: { ngo: { include: { user: true } }, user: true },
    });
  },

  // List all volunteers for a specific NGO
  async findByNGO(ngoId) {
    const prisma = getPrismaClient();
    return await prisma.volunteer.findMany({
      where: { ngoId },
      include: { user: { select: { id: true, email: true, phone: true, isVerified: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Update volunteer
  async update(id, data) {
    const prisma = getPrismaClient();
    return await prisma.volunteer.update({
      where: { id },
      data,
      include: { ngo: { include: { user: true } }, user: true },
    });
  },

  // Count pending volunteers for an NGO
  async countPending(ngoId) {
    const prisma = getPrismaClient();
    return await prisma.volunteer.count({ where: { ngoId, status: 'PENDING' } });
  },
};
