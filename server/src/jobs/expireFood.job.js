import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { getIO, emitToUser, emitToRole } from '../sockets/index.js';
import logger from '../utils/logger.js';
import { EmailService } from '../services/email.service.js';

const prisma = new PrismaClient();
const emailService = new EmailService();

/**
 * Job 1: Every 10 minutes - Mark expired listings and cascade reject requests
 */
function scheduleExpiryCheck() {
  cron.schedule('*/10 * * * *', async () => {
    try {
      logger.info('⏰ Running expiry check job...');
      
      const now = new Date();
      
      // Find all AVAILABLE listings that have expired
      const expiredListings = await prisma.foodListing.findMany({
        where: {
          status: 'AVAILABLE',
          expiryTime: {
            lt: now,
          },
        },
        include: {
          restaurant: {
            include: {
              user: true,
            },
          },
          requests: true,
        },
      });

      logger.info(`📭 Found ${expiredListings.length} expired listings`);

      for (const listing of expiredListings) {
        // Update listing status to PICKED (expired)
        await prisma.foodListing.update({
          where: { id: listing.id },
          data: { status: 'PICKED' },
        });

        logger.info(`✅ Marked listing ${listing.id} as PICKED (expired)`);

        // Reject all PENDING requests for this listing
        const pendingRequests = await prisma.foodRequest.findMany({
          where: {
            foodListingId: listing.id,
            status: 'PENDING',
          },
          include: {
            ngo: {
              include: {
                user: true,
              },
            },
          },
        });

        for (const request of pendingRequests) {
          // Update request status to REJECTED
          await prisma.foodRequest.update({
            where: { id: request.id },
            data: {
              status: 'REJECTED',
              rejectionReason: 'Food listing expired',
            },
          });

          // Notify NGO via socket
          const io = getIO();
          io.to(`user:${request.ngo.userId}`).emit('request:status_changed', {
            requestId: request.id,
            status: 'REJECTED',
            reason: 'Food listing expired',
            timestamp: new Date(),
          });

          // Send email notification
          await emailService.sendRequestRejectedEmail(
            request.ngo.user.email,
            request.ngo.user.name,
            listing.foodName,
            'Food listing has expired'
          );

          logger.info(`📧 Notified NGO ${request.ngo.id} about expired request`);
        }

        // Send email to restaurant
        await emailService.sendListingExpiredEmail(
          listing.restaurant.user.email,
          listing.restaurant.user.name,
          listing.foodName,
          pendingRequests.length
        );

        // Emit socket event to restaurant
        const io = getIO();
        io.to(`user:${listing.restaurant.userId}`).emit('food:status_changed', {
          listingId: listing.id,
          status: 'PICKED',
          message: 'Your listing has expired',
          timestamp: new Date(),
        });
      }

      logger.info('✅ Expiry check job completed');
    } catch (error) {
      logger.error('❌ Error in expiry check job:', error);
    }
  });
}

/**
 * Job 2: Every 10 minutes - Send "expiring soon" warnings (1 hour warning)
 */
function scheduleExpiringWarnings() {
  cron.schedule('*/10 * * * *', async () => {
    try {
      logger.info('⏰ Checking for listings expiring soon...');
      
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Find AVAILABLE listings expiring within 1 hour that haven't been warned yet
      const expiringListings = await prisma.foodListing.findMany({
        where: {
          status: 'AVAILABLE',
          expiryTime: {
            gt: now,
            lte: oneHourFromNow,
          },
        },
        include: {
          restaurant: {
            include: {
              user: true,
            },
          },
        },
      });

      logger.info(`⏳ Found ${expiringListings.length} listings expiring soon`);

      for (const listing of expiringListings) {
        const timeUntilExpiry = Math.round((listing.expiryTime - now) / 60000);

        // Send email warning
        await emailService.sendListingExpiringWarning(
          listing.restaurant.user.email,
          listing.restaurant.user.name,
          listing.foodName,
          timeUntilExpiry
        );

        // Emit socket event
        const io = getIO();
        io.to(`user:${listing.restaurant.userId}`).emit('food:expiring_soon', {
          listingId: listing.id,
          foodName: listing.foodName,
          expiresIn: timeUntilExpiry,
          timestamp: new Date(),
        });

        logger.info(`⏳ Notified restaurant ${listing.restaurantId} - listing expires in ${timeUntilExpiry} minutes`);
      }

      logger.info('✅ Expiring warnings job completed');
    } catch (error) {
      logger.error('❌ Error in expiring warnings job:', error);
    }
  });
}

/**
 * Initialize all expiry-related jobs
 */
export function startExpiryJob() {
  logger.info('🚀 Starting expiry jobs...');
  scheduleExpiryCheck();
  scheduleExpiringWarnings();
  logger.info('✅ Expiry jobs initialized');
}
