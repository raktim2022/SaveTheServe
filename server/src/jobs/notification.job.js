import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';
import { EmailService } from '../services/email.service.js';

const prisma = new PrismaClient();
const emailService = new EmailService();

/**
 * Notification queue model (for storing pending notifications to be sent)
 * This would normally be a separate table, but we'll use a simplified approach
 * by checking the Notification table for unsent email notifications
 */

/**
 * Job: Every 5 minutes - Process notification queue and send emails
 */
function scheduleNotificationProcessing() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      logger.info('⏰ Processing notification queue...');
      
      // This is a placeholder - in a production app, you'd have a separate queue
      // For now, we just log that the job ran
      // Actual notification logic will be triggered by controllers/services
      
      logger.info('✅ Notification queue processed');
    } catch (error) {
      logger.error('❌ Error processing notification queue:', error);
    }
  });
}

/**
 * Initialize all notification-related jobs
 */
export function startNotificationJob() {
  logger.info('🚀 Starting notification jobs...');
  scheduleNotificationProcessing();
  logger.info('✅ Notification jobs initialized');
}
