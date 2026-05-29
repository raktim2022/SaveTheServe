import { PrismaClient } from '@prisma/client';
import { getIO, emitToUser } from '../sockets/index.js';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Create a new notification
 */
export async function createNotification(userId, type, title, body, data = null, channel = 'IN_APP') {
  try {
    // Save notification to DB
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        data: data || {},
        channel,
        isRead: false,
      },
    });

    // Emit socket event to user
    if (channel === 'IN_APP' || channel === 'ALL') {
      try {
        const io = getIO();
        io.to(`user:${userId}`).emit('notification:new', {
          notificationId: notification.id,
          type,
          title,
          body,
          data,
          timestamp: new Date(),
        });
      } catch (error) {
        logger.warn(`Could not emit socket event for notification ${notification.id}:`, error.message);
      }
    }

    logger.info(`📢 Created notification for user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    logger.error('❌ Error creating notification:', error);
    throw error;
  }
}

/**
 * Get all notifications for a user (paginated)
 */
export async function getNotifications(userId, page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({
        where: { userId },
      }),
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error('❌ Error fetching notifications:', error);
    throw error;
  }
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: { sentAt: 'desc' },
      take: 50,
    });

    return notifications;
  } catch (error) {
    logger.error('❌ Error fetching unread notifications:', error);
    throw error;
  }
}

/**
 * Get unread count for a user
 */
export async function getUnreadCount(userId) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  } catch (error) {
    logger.error('❌ Error fetching unread count:', error);
    throw error;
  }
}

/**
 * Mark a specific notification as read
 */
export async function markNotificationAsRead(notificationId, userId) {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized - notification belongs to different user');
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    logger.info(`✅ Marked notification ${notificationId} as read`);
    return updated;
  } catch (error) {
    logger.error('❌ Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    logger.info(`✅ Marked ${result.count} notifications as read for user ${userId}`);
    return result;
  } catch (error) {
    logger.error('❌ Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId, userId) {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized - notification belongs to different user');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    logger.info(`🗑️  Deleted notification ${notificationId}`);
  } catch (error) {
    logger.error('❌ Error deleting notification:', error);
    throw error;
  }
}

/**
 * Delete all notifications for a user
 */
export async function deleteAllNotifications(userId) {
  try {
    const result = await prisma.notification.deleteMany({
      where: { userId },
    });

    logger.info(`🗑️  Deleted ${result.count} notifications for user ${userId}`);
    return result;
  } catch (error) {
    logger.error('❌ Error deleting all notifications:', error);
    throw error;
  }
}

/**
 * Send bulk notification to multiple users
 */
export async function sendBulkNotification(userIds, type, title, body, data = null) {
  try {
    const notifications = await Promise.all(
      userIds.map((userId) =>
        createNotification(userId, type, title, body, data, 'IN_APP')
      )
    );

    logger.info(`📢 Sent bulk notification to ${notifications.length} users`);
    return notifications;
  } catch (error) {
    logger.error('❌ Error sending bulk notification:', error);
    throw error;
  }
}

/**
 * Send notification by role (to all users with a specific role)
 */
export async function sendNotificationByRole(role, type, title, body, data = null) {
  try {
    const users = await prisma.user.findMany({
      where: { role },
      select: { id: true },
    });

    const userIds = users.map((u) => u.id);
    const notifications = await sendBulkNotification(userIds, type, title, body, data);

    logger.info(`📢 Sent notification to ${notifications.length} users with role ${role}`);
    return notifications;
  } catch (error) {
    logger.error('❌ Error sending notification by role:', error);
    throw error;
  }
}
