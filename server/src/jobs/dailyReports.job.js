import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';
import { EmailService } from '../services/email.service.js';

const prisma = new PrismaClient();
const emailService = new EmailService();

/**
 * Job: Every day at 8 AM - Generate and email daily impact reports
 */
function scheduleDailyReports() {
  cron.schedule('0 8 * * *', async () => {
    try {
      logger.info('⏰ Running daily reports job...');
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get yesterday's completed pickups
      const completedPickups = await prisma.foodRequest.findMany({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            gte: yesterday,
            lt: today,
          },
        },
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
          ngo: {
            include: {
              user: true,
            },
          },
        },
      });

      logger.info(`📊 Found ${completedPickups.length} completed pickups from yesterday`);

      // Calculate stats
      let totalKgSaved = 0;
      let totalPeopleFed = 0;

      const restaurantStats = {};
      const ngoStats = {};

      for (const pickup of completedPickups) {
        const kg = pickup.foodListing.quantity || 0;
        totalKgSaved += kg;
        totalPeopleFed += kg * 4; // Rough estimate: 4 people per kg

        // Aggregate restaurant stats
        const restaurantId = pickup.foodListing.restaurantId;
        if (!restaurantStats[restaurantId]) {
          restaurantStats[restaurantId] = {
            id: restaurantId,
            name: pickup.foodListing.restaurant.shopName,
            email: pickup.foodListing.restaurant.user.email,
            userId: pickup.foodListing.restaurant.userId,
            kg: 0,
            pickups: 0,
          };
        }
        restaurantStats[restaurantId].kg += kg;
        restaurantStats[restaurantId].pickups += 1;

        // Aggregate NGO stats
        const ngoId = pickup.ngoId;
        if (!ngoStats[ngoId]) {
          ngoStats[ngoId] = {
            id: ngoId,
            name: pickup.ngo.ngoName,
            email: pickup.ngo.user.email,
            userId: pickup.ngo.userId,
            kg: 0,
            pickups: 0,
            peopleFed: 0,
          };
        }
        ngoStats[ngoId].kg += kg;
        ngoStats[ngoId].pickups += 1;
        ngoStats[ngoId].peopleFed += kg * 4;
      }

      // Send emails to restaurants
      logger.info('📧 Sending reports to restaurants...');
      for (const restaurantId in restaurantStats) {
        const stats = restaurantStats[restaurantId];
        try {
          await emailService.sendDailyImpactReport(
            stats.email,
            stats.name,
            stats.kg,
            stats.pickups,
            'RESTAURANT'
          );
          logger.info(`📧 Sent report to restaurant ${stats.name}`);
        } catch (error) {
          logger.error(`❌ Failed to send report to restaurant ${stats.name}:`, error);
        }
      }

      // Send emails to NGOs
      logger.info('📧 Sending reports to NGOs...');
      for (const ngoId in ngoStats) {
        const stats = ngoStats[ngoId];
        try {
          await emailService.sendDailyImpactReport(
            stats.email,
            stats.name,
            stats.kg,
            stats.pickups,
            'NGO',
            stats.peopleFed
          );
          logger.info(`📧 Sent report to NGO ${stats.name}`);
        } catch (error) {
          logger.error(`❌ Failed to send report to NGO ${stats.name}:`, error);
        }
      }

      // Update global stats if a CityStats model exists in the future
      logger.info(`✅ Daily reports job completed - ${completedPickups.length} pickups, ${totalKgSaved}kg saved, ${totalPeopleFed} people fed`);
    } catch (error) {
      logger.error('❌ Error in daily reports job:', error);
    }
  });
}

/**
 * Initialize all reporting-related jobs
 */
export function startDailyReportsJob() {
  logger.info('🚀 Starting daily reports jobs...');
  scheduleDailyReports();
  logger.info('✅ Daily reports jobs initialized');
}
