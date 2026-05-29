import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Job: Every day at midnight - Clean up old data and expired tokens
 */
function scheduleCleanup() {
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('⏰ Running cleanup job...');
      
      const now = new Date();

      // Clean up expired verification tokens (older than 24 hours)
      const expiredTokensCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const clearedTokens = await prisma.user.updateMany({
        where: {
          AND: [
            { verificationToken: { not: null } },
            { verificationTokenExpiry: { lt: expiredTokensCutoff } },
          ],
        },
        data: {
          verificationToken: null,
          verificationTokenExpiry: null,
        },
      });

      logger.info(`🧹 Cleared ${clearedTokens.count} expired verification tokens`);

      // Clean up expired phone OTPs for volunteers
      const expiredOtpsCutoff = new Date(now.getTime() - 15 * 60 * 1000); // 15 minutes
      
      const clearedOtps = await prisma.volunteer.updateMany({
        where: {
          AND: [
            { phoneOtp: { not: null } },
            { phoneOtpExpiry: { lt: expiredOtpsCutoff } },
          ],
        },
        data: {
          phoneOtp: null,
          phoneOtpExpiry: null,
        },
      });

      logger.info(`🧹 Cleared ${clearedOtps.count} expired phone OTPs`);

      // Clean up old pickup logs (older than 90 days)
      const oldPickupLogsCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      
      const deletedPickupLogs = await prisma.pickupLog.deleteMany({
        where: {
          timestamp: {
            lt: oldPickupLogsCutoff,
          },
        },
      });

      logger.info(`🧹 Deleted ${deletedPickupLogs.count} old pickup logs (>90 days)`);

      // Archive or clean old food requests (older than 180 days, non-completed ones)
      const oldFoodRequestsCutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      
      const updatedOldRequests = await prisma.foodRequest.updateMany({
        where: {
          AND: [
            { status: { not: 'COMPLETED' } },
            { createdAt: { lt: oldFoodRequestsCutoff } },
          ],
        },
        data: {
          status: 'CANCELLED',
        },
      });

      logger.info(`🧹 Archived ${updatedOldRequests.count} old incomplete food requests (>180 days)`);

      logger.info('✅ Cleanup job completed');
    } catch (error) {
      logger.error('❌ Error in cleanup job:', error);
    }
  });
}

/**
 * Initialize all cleanup-related jobs
 */
export function startCleanupJob() {
  logger.info('🚀 Starting cleanup jobs...');
  scheduleCleanup();
  logger.info('✅ Cleanup jobs initialized');
}
